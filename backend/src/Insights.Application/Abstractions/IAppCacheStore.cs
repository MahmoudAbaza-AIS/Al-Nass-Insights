using Insights.Domain.Kpis;
using Insights.Domain.Sync;

namespace Insights.Application.Abstractions;

public interface IAppCacheStore
{
    Task<KpiValue?> GetLatestAsync(CanonicalKpiId kpiId, string dimensionKey, CancellationToken cancellationToken);

    Task<IReadOnlyList<KpiValue>> GetHistoryAsync(
        CanonicalKpiId kpiId,
        DateOnly fromInclusive,
        DateOnly toInclusive,
        CancellationToken cancellationToken);

    Task<long> BeginSyncRunAsync(RefreshTier tier, CancellationToken cancellationToken);

    Task CompleteSyncRunAsync(
        long syncRunId,
        SyncRunOutcome outcome,
        string? diagnostics,
        CancellationToken cancellationToken);

    Task PublishAtomicAsync(
        long syncRunId,
        IReadOnlyList<KpiValue> values,
        CancellationToken cancellationToken);

    Task<bool> TryAcquireSyncLeaseAsync(RefreshTier tier, TimeSpan leaseDuration, CancellationToken cancellationToken);

    Task ReleaseSyncLeaseAsync(RefreshTier tier, CancellationToken cancellationToken);

    Task UpsertSymbolMetadataAsync(IReadOnlyList<SymbolMetadataRecord> symbols, CancellationToken cancellationToken);

    Task<IReadOnlyList<SymbolMetadataRecord>> GetSymbolMetadataAsync(CancellationToken cancellationToken);
}

public sealed record SymbolMetadataRecord(
    string SymbolId,
    string Name,
    string? Category,
    string PayloadJson,
    DateTimeOffset CapturedAt,
    string SourceVersion);
