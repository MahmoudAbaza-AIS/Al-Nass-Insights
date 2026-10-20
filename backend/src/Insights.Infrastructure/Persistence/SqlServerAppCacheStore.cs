using System.Data;
using Dapper;
using Insights.Application.Abstractions;
using Insights.Domain.Kpis;
using Insights.Domain.Sync;
using Insights.Infrastructure.Options;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace Insights.Infrastructure.Persistence;

public sealed class SqlServerAppCacheStore(IOptions<AppCacheOptions> options) : IAppCacheStore
{
    private readonly string _connectionString = options.Value.ConnectionString
        ?? throw new InvalidOperationException("AppCache connection string is required.");
    private readonly int _timeout = options.Value.CommandTimeoutSeconds;
    private readonly string _holderId = $"{Environment.MachineName}:{Environment.ProcessId}";

    public async Task<KpiValue?> GetLatestAsync(CanonicalKpiId kpiId, string dimensionKey, CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        var row = await conn.QuerySingleOrDefaultAsync<KpiRow>(new CommandDefinition(
            """
            SELECT kpi_id, grain, period_start, dimension_key, numerator, denominator, value, unit,
                   is_final, captured_at_utc, query_version, sync_run_id, state, explanation
            FROM dbo.kpi_value_latest
            WHERE kpi_id = @kpiId AND dimension_key = @dimensionKey
            """,
            new { kpiId = kpiId.Value, dimensionKey },
            commandTimeout: _timeout,
            cancellationToken: cancellationToken));

        return row?.ToDomain();
    }

    public async Task<IReadOnlyList<KpiValue>> GetHistoryAsync(
        CanonicalKpiId kpiId,
        DateOnly fromInclusive,
        DateOnly toInclusive,
        CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        var rows = await conn.QueryAsync<KpiRow>(new CommandDefinition(
            """
            SELECT kpi_id, grain, period_start, dimension_key, numerator, denominator, value, unit,
                   is_final, captured_at_utc, query_version, sync_run_id, state, explanation
            FROM dbo.kpi_value
            WHERE kpi_id = @kpiId AND period_start >= @fromInclusive AND period_start <= @toInclusive
            ORDER BY period_start
            """,
            new { kpiId = kpiId.Value, fromInclusive = fromInclusive.ToDateTime(TimeOnly.MinValue), toInclusive = toInclusive.ToDateTime(TimeOnly.MinValue) },
            commandTimeout: _timeout,
            cancellationToken: cancellationToken));

        return rows.Select(r => r.ToDomain()).ToList();
    }

    public async Task<long> BeginSyncRunAsync(RefreshTier tier, CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteScalarAsync<long>(new CommandDefinition(
            """
            INSERT INTO dbo.sync_run (tier, started_at_utc)
            OUTPUT INSERTED.sync_run_id
            VALUES (@tier, SYSUTCDATETIME())
            """,
            new { tier = (int)tier },
            commandTimeout: _timeout,
            cancellationToken: cancellationToken));
    }

    public async Task CompleteSyncRunAsync(long syncRunId, SyncRunOutcome outcome, string? diagnostics, CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        await conn.ExecuteAsync(new CommandDefinition(
            """
            UPDATE dbo.sync_run
            SET completed_at_utc = SYSUTCDATETIME(),
                outcome = @outcome,
                diagnostics = @diagnostics
            WHERE sync_run_id = @syncRunId
            """,
            new { syncRunId, outcome = outcome.ToString(), diagnostics },
            commandTimeout: _timeout,
            cancellationToken: cancellationToken));
    }

    public async Task PublishAtomicAsync(long syncRunId, IReadOnlyList<KpiValue> values, CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync(cancellationToken);
        await using var tx = (SqlTransaction)await conn.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        foreach (var v in values)
        {
            // Preserve last-good numeric: skip null RefreshFailure overwrite of existing numeric latest.
            if (v.State == KpiPublicationState.RefreshFailure && v.Value is null)
            {
                var existing = await conn.ExecuteScalarAsync<decimal?>(new CommandDefinition(
                    "SELECT value FROM dbo.kpi_value_latest WHERE kpi_id=@kpiId AND dimension_key=@dim",
                    new { kpiId = v.KpiId.Value, dim = v.DimensionKey },
                    transaction: tx,
                    commandTimeout: _timeout,
                    cancellationToken: cancellationToken));
                if (existing is not null)
                    continue;
            }

            await conn.ExecuteAsync(new CommandDefinition(
                """
                MERGE dbo.kpi_value AS t
                USING (SELECT @kpiId AS kpi_id, @grain AS grain, @periodStart AS period_start, @dimensionKey AS dimension_key) AS s
                ON t.kpi_id = s.kpi_id AND t.grain = s.grain AND t.period_start = s.period_start AND t.dimension_key = s.dimension_key
                WHEN MATCHED THEN UPDATE SET
                    numerator=@numerator, denominator=@denominator, value=@value, unit=@unit, is_final=@isFinal,
                    captured_at_utc=@capturedAt, query_version=@queryVersion, sync_run_id=@syncRunId, state=@state, explanation=@explanation
                WHEN NOT MATCHED THEN INSERT
                    (kpi_id, grain, period_start, dimension_key, numerator, denominator, value, unit, is_final,
                     captured_at_utc, query_version, sync_run_id, state, explanation)
                VALUES
                    (@kpiId, @grain, @periodStart, @dimensionKey, @numerator, @denominator, @value, @unit, @isFinal,
                     @capturedAt, @queryVersion, @syncRunId, @state, @explanation);

                MERGE dbo.kpi_value_latest AS t
                USING (SELECT @kpiId AS kpi_id, @dimensionKey AS dimension_key) AS s
                ON t.kpi_id = s.kpi_id AND t.dimension_key = s.dimension_key
                WHEN MATCHED THEN UPDATE SET
                    grain=@grain, period_start=@periodStart, numerator=@numerator, denominator=@denominator, value=@value,
                    unit=@unit, is_final=@isFinal, captured_at_utc=@capturedAt, query_version=@queryVersion,
                    sync_run_id=@syncRunId, state=@state, explanation=@explanation
                WHEN NOT MATCHED THEN INSERT
                    (kpi_id, dimension_key, grain, period_start, numerator, denominator, value, unit, is_final,
                     captured_at_utc, query_version, sync_run_id, state, explanation)
                VALUES
                    (@kpiId, @dimensionKey, @grain, @periodStart, @numerator, @denominator, @value, @unit, @isFinal,
                     @capturedAt, @queryVersion, @syncRunId, @state, @explanation);
                """,
                new
                {
                    kpiId = v.KpiId.Value,
                    grain = v.Grain.ToString(),
                    periodStart = v.PeriodStart.ToDateTime(TimeOnly.MinValue),
                    dimensionKey = v.DimensionKey,
                    numerator = v.Numerator,
                    denominator = v.Denominator,
                    value = v.Value,
                    unit = v.Unit,
                    isFinal = v.IsFinal,
                    capturedAt = v.CapturedAt.UtcDateTime,
                    queryVersion = v.QueryVersion,
                    syncRunId,
                    state = v.State.ToString(),
                    explanation = v.Explanation
                },
                transaction: tx,
                commandTimeout: _timeout,
                cancellationToken: cancellationToken));
        }

        await tx.CommitAsync(cancellationToken);
    }

    public async Task<bool> TryAcquireSyncLeaseAsync(RefreshTier tier, TimeSpan leaseDuration, CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        var rows = await conn.ExecuteAsync(new CommandDefinition(
            """
            MERGE dbo.sync_lease AS t
            USING (SELECT @tier AS tier) AS s
            ON t.tier = s.tier
            WHEN MATCHED AND t.lease_until_utc < SYSUTCDATETIME() THEN
                UPDATE SET holder_id = @holderId, lease_until_utc = DATEADD(SECOND, @seconds, SYSUTCDATETIME())
            WHEN NOT MATCHED THEN
                INSERT (tier, holder_id, lease_until_utc)
                VALUES (@tier, @holderId, DATEADD(SECOND, @seconds, SYSUTCDATETIME()));
            """,
            new { tier = (int)tier, holderId = _holderId, seconds = (int)leaseDuration.TotalSeconds },
            commandTimeout: _timeout,
            cancellationToken: cancellationToken));

        var holder = await conn.ExecuteScalarAsync<string>(new CommandDefinition(
            "SELECT holder_id FROM dbo.sync_lease WHERE tier = @tier AND lease_until_utc >= SYSUTCDATETIME()",
            new { tier = (int)tier },
            commandTimeout: _timeout,
            cancellationToken: cancellationToken));

        return string.Equals(holder, _holderId, StringComparison.Ordinal);
    }

    public async Task ReleaseSyncLeaseAsync(RefreshTier tier, CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        await conn.ExecuteAsync(new CommandDefinition(
            "DELETE FROM dbo.sync_lease WHERE tier = @tier AND holder_id = @holderId",
            new { tier = (int)tier, holderId = _holderId },
            commandTimeout: _timeout,
            cancellationToken: cancellationToken));
    }

    public async Task UpsertSymbolMetadataAsync(IReadOnlyList<SymbolMetadataRecord> symbols, CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        foreach (var s in symbols)
        {
            await conn.ExecuteAsync(new CommandDefinition(
                """
                MERGE dbo.symbol_metadata AS t
                USING (SELECT @symbolId AS symbol_id) AS s ON t.symbol_id = s.symbol_id
                WHEN MATCHED THEN UPDATE SET name=@name, category=@category, payload_json=@payload, captured_at_utc=@capturedAt, source_version=@sourceVersion
                WHEN NOT MATCHED THEN INSERT (symbol_id, name, category, payload_json, captured_at_utc, source_version)
                VALUES (@symbolId, @name, @category, @payload, @capturedAt, @sourceVersion);
                """,
                new
                {
                    symbolId = s.SymbolId,
                    name = s.Name,
                    category = s.Category,
                    payload = s.PayloadJson,
                    capturedAt = s.CapturedAt.UtcDateTime,
                    sourceVersion = s.SourceVersion
                },
                commandTimeout: _timeout,
                cancellationToken: cancellationToken));
        }
    }

    public async Task<IReadOnlyList<SymbolMetadataRecord>> GetSymbolMetadataAsync(CancellationToken cancellationToken)
    {
        await using var conn = new SqlConnection(_connectionString);
        var rows = await conn.QueryAsync<SymbolRow>(new CommandDefinition(
            "SELECT symbol_id, name, category, payload_json, captured_at_utc, source_version FROM dbo.symbol_metadata ORDER BY symbol_id",
            commandTimeout: _timeout,
            cancellationToken: cancellationToken));

        return rows.Select(r => new SymbolMetadataRecord(
            r.symbol_id,
            r.name,
            r.category,
            r.payload_json,
            new DateTimeOffset(DateTime.SpecifyKind(r.captured_at_utc, DateTimeKind.Utc)),
            r.source_version)).ToList();
    }

    private sealed class SymbolRow
    {
        public string symbol_id { get; init; } = "";
        public string name { get; init; } = "";
        public string? category { get; init; }
        public string payload_json { get; init; } = "{}";
        public DateTime captured_at_utc { get; init; }
        public string source_version { get; init; } = "";
    }

    private sealed class KpiRow
    {
        public string kpi_id { get; init; } = "";
        public string grain { get; init; } = "";
        public DateTime period_start { get; init; }
        public string dimension_key { get; init; } = "";
        public decimal? numerator { get; init; }
        public decimal? denominator { get; init; }
        public decimal? value { get; init; }
        public string? unit { get; init; }
        public bool is_final { get; init; }
        public DateTime captured_at_utc { get; init; }
        public string query_version { get; init; } = "";
        public long sync_run_id { get; init; }
        public string state { get; init; } = "";
        public string? explanation { get; init; }

        public KpiValue ToDomain() => new()
        {
            KpiId = CanonicalKpiId.Parse(kpi_id),
            Grain = Enum.Parse<KpiGrain>(grain),
            PeriodStart = DateOnly.FromDateTime(period_start),
            DimensionKey = dimension_key,
            Numerator = numerator,
            Denominator = denominator,
            Value = value,
            Unit = unit,
            IsFinal = is_final,
            CapturedAt = new DateTimeOffset(DateTime.SpecifyKind(captured_at_utc, DateTimeKind.Utc)),
            QueryVersion = query_version,
            SyncRunId = sync_run_id,
            State = Enum.Parse<KpiPublicationState>(state),
            Explanation = explanation
        };
    }
}
