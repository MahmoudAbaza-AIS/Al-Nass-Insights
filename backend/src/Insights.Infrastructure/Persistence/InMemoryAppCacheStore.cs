using System.Collections.Concurrent;
using Insights.Application.Abstractions;
using Insights.Domain.Kpis;
using Insights.Domain.Sync;

namespace Insights.Infrastructure.Persistence;

/// <summary>
/// Development/test persistent-in-process store. Not a substitute for production SQL cache.
/// </summary>
public sealed class InMemoryAppCacheStore : IAppCacheStore
{
    private readonly ConcurrentDictionary<string, KpiValue> _latest = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, List<KpiValue>> _history = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<int, DateTimeOffset> _leases = new();
    private readonly ConcurrentDictionary<string, SymbolMetadataRecord> _symbols = new(StringComparer.OrdinalIgnoreCase);
    private long _runId;

    public Task<KpiValue?> GetLatestAsync(CanonicalKpiId kpiId, string dimensionKey, CancellationToken cancellationToken)
    {
        _latest.TryGetValue(Key(kpiId.Value, dimensionKey), out var value);
        return Task.FromResult(value);
    }

    public Task<IReadOnlyList<KpiValue>> GetHistoryAsync(
        CanonicalKpiId kpiId,
        DateOnly fromInclusive,
        DateOnly toInclusive,
        CancellationToken cancellationToken)
    {
        if (!_history.TryGetValue(kpiId.Value, out var list))
            return Task.FromResult<IReadOnlyList<KpiValue>>([]);

        var rows = list
            .Where(v => v.PeriodStart >= fromInclusive && v.PeriodStart <= toInclusive)
            .OrderBy(v => v.PeriodStart)
            .ToList();
        return Task.FromResult<IReadOnlyList<KpiValue>>(rows);
    }

    public Task<long> BeginSyncRunAsync(RefreshTier tier, CancellationToken cancellationToken) =>
        Task.FromResult(Interlocked.Increment(ref _runId));

    public Task CompleteSyncRunAsync(long syncRunId, SyncRunOutcome outcome, string? diagnostics, CancellationToken cancellationToken) =>
        Task.CompletedTask;

    public Task PublishAtomicAsync(long syncRunId, IReadOnlyList<KpiValue> values, CancellationToken cancellationToken)
    {
        foreach (var value in values)
        {
            var key = Key(value.KpiId.Value, value.DimensionKey);
            // Last-good: do not overwrite Fresh/Stale/Partial with RefreshFailure placeholder in same publish batch
            // when value is null and previous had a numeric — handled by orchestrator not emitting failure overwrites.
            _latest[key] = value;

            var histKey = value.KpiId.Value;
            var hist = _history.GetOrAdd(histKey, _ => []);
            lock (hist)
            {
                hist.RemoveAll(h => h.PeriodStart == value.PeriodStart && h.DimensionKey == value.DimensionKey);
                hist.Add(value);
            }
        }

        return Task.CompletedTask;
    }

    public Task<bool> TryAcquireSyncLeaseAsync(RefreshTier tier, TimeSpan leaseDuration, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var until = now.Add(leaseDuration);
        if (_leases.TryGetValue((int)tier, out var existing) && existing > now)
            return Task.FromResult(false);

        _leases[(int)tier] = until;
        return Task.FromResult(true);
    }

    public Task ReleaseSyncLeaseAsync(RefreshTier tier, CancellationToken cancellationToken)
    {
        _leases.TryRemove((int)tier, out _);
        return Task.CompletedTask;
    }

    public Task UpsertSymbolMetadataAsync(IReadOnlyList<SymbolMetadataRecord> symbols, CancellationToken cancellationToken)
    {
        foreach (var s in symbols)
            _symbols[s.SymbolId] = s;
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<SymbolMetadataRecord>> GetSymbolMetadataAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<SymbolMetadataRecord>>(_symbols.Values.OrderBy(s => s.SymbolId).ToList());

    private static string Key(string kpiId, string dimensionKey) => $"{kpiId}::{dimensionKey}";
}
