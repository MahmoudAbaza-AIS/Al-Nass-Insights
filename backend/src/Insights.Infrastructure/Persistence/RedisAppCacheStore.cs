using System.Text.Json;
using System.Text.Json.Serialization;
using Insights.Application.Abstractions;
using Insights.Domain.Kpis;
using Insights.Domain.Sync;
using Insights.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace Insights.Infrastructure.Persistence;

/// <summary>
/// Application-owned KPI cache backed by Redis (Docker service <c>alnass-redis</c>).
/// </summary>
public sealed class RedisAppCacheStore : IAppCacheStore, IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly IConnectionMultiplexer _mux;
    private readonly IDatabase _db;
    private readonly ILogger<RedisAppCacheStore> _logger;
    private readonly string _holderId = $"{Environment.MachineName}:{Environment.ProcessId}";
    private readonly string _prefix;

    public RedisAppCacheStore(IOptions<AppCacheOptions> options, ILogger<RedisAppCacheStore> logger)
    {
        var opts = options.Value;
        if (string.IsNullOrWhiteSpace(opts.ConnectionString))
            throw new InvalidOperationException("AppCache connection string is required for Redis (e.g. redis:6379).");

        _logger = logger;
        _prefix = string.IsNullOrWhiteSpace(opts.KeyPrefix) ? "alnass" : opts.KeyPrefix.Trim().TrimEnd(':');
        _mux = ConnectionMultiplexer.Connect(opts.ConnectionString);
        _db = _mux.GetDatabase();
        _logger.LogInformation("Redis app cache connected ({Endpoint}).", opts.ConnectionString);
    }

    public async Task<KpiValue?> GetLatestAsync(CanonicalKpiId kpiId, string dimensionKey, CancellationToken cancellationToken)
    {
        var json = await _db.StringGetAsync(LatestKey(kpiId.Value, dimensionKey)).WaitAsync(cancellationToken);
        return json.IsNullOrEmpty ? null : DeserializeKpi(json!);
    }

    public async Task<IReadOnlyList<KpiValue>> GetHistoryAsync(
        CanonicalKpiId kpiId,
        DateOnly fromInclusive,
        DateOnly toInclusive,
        CancellationToken cancellationToken)
    {
        var entries = await _db.HashGetAllAsync(HistoryKey(kpiId.Value)).WaitAsync(cancellationToken);
        if (entries.Length == 0)
            return [];

        var rows = new List<KpiValue>();
        foreach (var entry in entries)
        {
            if (entry.Value.IsNullOrEmpty)
                continue;
            var kpi = DeserializeKpi(entry.Value!);
            if (kpi.PeriodStart >= fromInclusive && kpi.PeriodStart <= toInclusive)
                rows.Add(kpi);
        }

        return rows.OrderBy(v => v.PeriodStart).ToList();
    }

    public async Task<long> BeginSyncRunAsync(RefreshTier tier, CancellationToken cancellationToken)
    {
        var id = await _db.StringIncrementAsync(Key("sync:run:seq")).WaitAsync(cancellationToken);
        await _db.HashSetAsync(
            Key($"sync:run:{id}"),
            [
                new HashEntry("tier", (int)tier),
                new HashEntry("startedAtUtc", DateTimeOffset.UtcNow.ToString("O")),
            ]).WaitAsync(cancellationToken);
        return id;
    }

    public async Task CompleteSyncRunAsync(
        long syncRunId,
        SyncRunOutcome outcome,
        string? diagnostics,
        CancellationToken cancellationToken)
    {
        await _db.HashSetAsync(
            Key($"sync:run:{syncRunId}"),
            [
                new HashEntry("completedAtUtc", DateTimeOffset.UtcNow.ToString("O")),
                new HashEntry("outcome", outcome.ToString()),
                new HashEntry("diagnostics", diagnostics ?? string.Empty),
            ]).WaitAsync(cancellationToken);
    }

    public async Task PublishAtomicAsync(
        long syncRunId,
        IReadOnlyList<KpiValue> values,
        CancellationToken cancellationToken)
    {
        // Redis MULTI/EXEC batches the writes; last-good guard runs before enqueue.
        var tran = _db.CreateTransaction();
        foreach (var v in values)
        {
            if (v.State == KpiPublicationState.RefreshFailure && v.Value is null)
            {
                var existingJson = await _db.StringGetAsync(LatestKey(v.KpiId.Value, v.DimensionKey))
                    .WaitAsync(cancellationToken);
                if (!existingJson.IsNullOrEmpty)
                {
                    var existing = DeserializeKpi(existingJson!);
                    if (existing.Value is not null)
                        continue;
                }
            }

            var published = CloneWithSyncRun(v, syncRunId);
            var json = SerializeKpi(published);
            var latest = LatestKey(published.KpiId.Value, published.DimensionKey);
            var hist = HistoryKey(published.KpiId.Value);
            var histField = HistoryField(published.PeriodStart, published.DimensionKey);

            _ = tran.StringSetAsync(latest, json);
            _ = tran.HashSetAsync(hist, histField, json);
        }

        var committed = await tran.ExecuteAsync().WaitAsync(cancellationToken);
        if (!committed)
            throw new InvalidOperationException("Redis publish transaction failed to commit.");
    }

    public async Task<bool> TryAcquireSyncLeaseAsync(RefreshTier tier, TimeSpan leaseDuration, CancellationToken cancellationToken)
    {
        var key = LeaseKey(tier);
        var acquired = await _db.StringSetAsync(
            key,
            _holderId,
            leaseDuration,
            When.NotExists).WaitAsync(cancellationToken);

        if (acquired)
            return true;

        var current = await _db.StringGetAsync(key).WaitAsync(cancellationToken);
        return string.Equals((string?)current, _holderId, StringComparison.Ordinal);
    }

    public async Task ReleaseSyncLeaseAsync(RefreshTier tier, CancellationToken cancellationToken)
    {
        const string script = """
            if redis.call('get', KEYS[1]) == ARGV[1] then
              return redis.call('del', KEYS[1])
            else
              return 0
            end
            """;
        await _db.ScriptEvaluateAsync(script, [LeaseKey(tier)], [_holderId]).WaitAsync(cancellationToken);
    }

    public async Task UpsertSymbolMetadataAsync(IReadOnlyList<SymbolMetadataRecord> symbols, CancellationToken cancellationToken)
    {
        if (symbols.Count == 0)
            return;

        var entries = symbols
            .Select(s => new HashEntry(s.SymbolId, JsonSerializer.Serialize(s, JsonOptions)))
            .ToArray();
        await _db.HashSetAsync(Key("symbols"), entries).WaitAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SymbolMetadataRecord>> GetSymbolMetadataAsync(CancellationToken cancellationToken)
    {
        var entries = await _db.HashGetAllAsync(Key("symbols")).WaitAsync(cancellationToken);
        if (entries.Length == 0)
            return [];

        return entries
            .Where(e => !e.Value.IsNullOrEmpty)
            .Select(e => JsonSerializer.Deserialize<SymbolMetadataRecord>((string)e.Value!, JsonOptions)!)
            .OrderBy(s => s.SymbolId)
            .ToList();
    }

    public void Dispose() => _mux.Dispose();

    private RedisKey Key(string suffix) => $"{_prefix}:{suffix}";

    private RedisKey LatestKey(string kpiId, string dimensionKey) =>
        Key($"kpi:latest:{kpiId}:{dimensionKey}");

    private RedisKey HistoryKey(string kpiId) => Key($"kpi:history:{kpiId}");

    private RedisKey LeaseKey(RefreshTier tier) => Key($"sync:lease:{(int)tier}");

    private static string HistoryField(DateOnly periodStart, string dimensionKey) =>
        $"{periodStart:yyyy-MM-dd}|{dimensionKey}";

    private static KpiValue CloneWithSyncRun(KpiValue value, long syncRunId) =>
        new()
        {
            KpiId = value.KpiId,
            Grain = value.Grain,
            PeriodStart = value.PeriodStart,
            DimensionKey = value.DimensionKey,
            Numerator = value.Numerator,
            Denominator = value.Denominator,
            Value = value.Value,
            Unit = value.Unit,
            IsFinal = value.IsFinal,
            CapturedAt = value.CapturedAt,
            QueryVersion = value.QueryVersion,
            SyncRunId = syncRunId,
            State = value.State,
            Explanation = value.Explanation
        };

    private static string SerializeKpi(KpiValue value)
    {
        var dto = new KpiDocument
        {
            KpiId = value.KpiId.Value,
            Grain = value.Grain,
            PeriodStart = value.PeriodStart.ToString("yyyy-MM-dd"),
            DimensionKey = value.DimensionKey,
            Numerator = value.Numerator,
            Denominator = value.Denominator,
            Value = value.Value,
            Unit = value.Unit,
            IsFinal = value.IsFinal,
            CapturedAt = value.CapturedAt,
            QueryVersion = value.QueryVersion,
            SyncRunId = value.SyncRunId,
            State = value.State,
            Explanation = value.Explanation
        };
        return JsonSerializer.Serialize(dto, JsonOptions);
    }

    private static KpiValue DeserializeKpi(string json)
    {
        var dto = JsonSerializer.Deserialize<KpiDocument>(json, JsonOptions)
            ?? throw new InvalidOperationException("Invalid KPI JSON in Redis.");
        return new KpiValue
        {
            KpiId = CanonicalKpiId.Parse(dto.KpiId),
            Grain = dto.Grain,
            PeriodStart = DateOnly.Parse(dto.PeriodStart),
            DimensionKey = dto.DimensionKey,
            Numerator = dto.Numerator,
            Denominator = dto.Denominator,
            Value = dto.Value,
            Unit = dto.Unit,
            IsFinal = dto.IsFinal,
            CapturedAt = dto.CapturedAt,
            QueryVersion = dto.QueryVersion,
            SyncRunId = dto.SyncRunId,
            State = dto.State,
            Explanation = dto.Explanation
        };
    }

    private sealed class KpiDocument
    {
        public string KpiId { get; init; } = "";
        public KpiGrain Grain { get; init; }
        public string PeriodStart { get; init; } = "";
        public string DimensionKey { get; init; } = "";
        public decimal? Numerator { get; init; }
        public decimal? Denominator { get; init; }
        public decimal? Value { get; init; }
        public string? Unit { get; init; }
        public bool IsFinal { get; init; }
        public DateTimeOffset CapturedAt { get; init; }
        public string QueryVersion { get; init; } = "";
        public long SyncRunId { get; init; }
        public KpiPublicationState State { get; init; }
        public string? Explanation { get; init; }
    }
}
