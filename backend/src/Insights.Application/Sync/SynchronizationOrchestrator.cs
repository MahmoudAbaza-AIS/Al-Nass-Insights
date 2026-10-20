using Insights.Application.Abstractions;
using Insights.Application.Catalog;
using Insights.Application.Freshness;
using Insights.Domain.Kpis;
using Insights.Domain.Sync;
using Insights.Domain.Time;
using Microsoft.Extensions.Logging;

namespace Insights.Application.Sync;

public sealed class SynchronizationOrchestrator(
    IAppCacheStore cache,
    IOracleKpiSource oracle,
    ISqlServerSymbolSource symbols,
    IClock clock,
    ILogger<SynchronizationOrchestrator> logger)
{
    /// <summary>
    /// Default active tier until hospital approves faster schedules.
    /// </summary>
    public static RefreshTier DefaultActiveTier => RefreshTier.Tier3Operational;

    public async Task<SyncRunOutcome> RunAsync(RefreshTier tier, CancellationToken cancellationToken)
    {
        var lease = FreshnessPolicy.Interval(tier);
        if (!await cache.TryAcquireSyncLeaseAsync(tier, lease, cancellationToken))
        {
            logger.LogWarning("Skipping sync for {Tier}: overlapping lease held.", tier);
            return SyncRunOutcome.SkippedOverlap;
        }

        long runId = 0;
        try
        {
            runId = await cache.BeginSyncRunAsync(tier, cancellationToken);
            var published = new List<KpiValue>();
            var now = clock.UtcNow;
            var today = CairoTime.Today(now);

            // Always materialize catalog availability states so dashboards never invent zeros.
            foreach (var entry in KpiCatalog.All.Where(e => e.RefreshTier == tier || tier == DefaultActiveTier))
            {
                if (ShouldSeedUnavailable(entry))
                {
                    published.Add(new KpiValue
                    {
                        KpiId = entry.CanonicalId,
                        Grain = KpiGrain.Snapshot,
                        PeriodStart = today,
                        Value = null,
                        Unit = entry.Unit,
                        CapturedAt = now,
                        QueryVersion = entry.QueryVersion ?? "n/a",
                        SyncRunId = runId,
                        State = MapCatalogState(entry.MappingStatus),
                        Explanation = entry.Explanation
                    });
                }
            }

            // Oracle observations — only approved versioned queries; never overwrite last-good with invalid rows.
            var queryVersions = KpiCatalog.All
                .Where(e => e.QueryVersion is not null && e.SourceSystem == "Oracle")
                .Select(e => e.QueryVersion!)
                .Distinct()
                .ToList();

            IReadOnlyList<SourceKpiObservation> observations = [];
            try
            {
                observations = await oracle.FetchApprovedQueriesAsync(queryVersions, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Oracle sync failed for run {RunId}; preserving last-good published values.", runId);
                await cache.CompleteSyncRunAsync(runId, SyncRunOutcome.Failed, ex.Message, cancellationToken);
                return SyncRunOutcome.Failed;
            }

            foreach (var obs in observations)
            {
                // Remove placeholder unavailable row for same KPI if we have a real observation.
                published.RemoveAll(p => p.KpiId.Value == obs.KpiId.Value && p.DimensionKey == obs.DimensionKey);
                published.Add(new KpiValue
                {
                    KpiId = obs.KpiId,
                    Grain = KpiGrain.Day,
                    PeriodStart = today,
                    DimensionKey = obs.DimensionKey,
                    Numerator = obs.Numerator,
                    Denominator = obs.Denominator,
                    Value = obs.Value,
                    Unit = obs.Unit,
                    CapturedAt = obs.ObservedAt,
                    QueryVersion = obs.QueryVersion,
                    SyncRunId = runId,
                    State = obs.SuggestedState,
                    Explanation = obs.Explanation
                });
            }

            // Deduplicate by canonical id for shared KPIs — one published value.
            published = published
                .GroupBy(p => $"{p.KpiId.Value.ToLowerInvariant()}|{p.DimensionKey.ToLowerInvariant()}")
                .Select(g => g.OrderByDescending(x => x.CapturedAt).First())
                .ToList();

            await cache.PublishAtomicAsync(runId, published, cancellationToken);

            try
            {
                var symbolRows = await symbols.FetchSymbolsAsync(cancellationToken);
                if (symbolRows.Count > 0)
                    await cache.UpsertSymbolMetadataAsync(symbolRows, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogWarning(ex, "Symbol metadata sync failed; KPI publication retained.");
            }

            var outcome = observations.Count > 0 ? SyncRunOutcome.Succeeded : SyncRunOutcome.Partial;
            await cache.CompleteSyncRunAsync(runId, outcome, $"published={published.Count};oracle={observations.Count}", cancellationToken);
            return outcome;
        }
        catch (OperationCanceledException)
        {
            if (runId > 0)
                await cache.CompleteSyncRunAsync(runId, SyncRunOutcome.Cancelled, "cancelled", CancellationToken.None);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Sync run failed.");
            if (runId > 0)
                await cache.CompleteSyncRunAsync(runId, SyncRunOutcome.Failed, ex.Message, CancellationToken.None);
            return SyncRunOutcome.Failed;
        }
        finally
        {
            await cache.ReleaseSyncLeaseAsync(tier, CancellationToken.None);
        }
    }

    private static bool ShouldSeedUnavailable(KpiCatalogEntry entry) =>
        entry.MappingStatus is not "Mapped-full" and not "Mapped-partial"
        || entry.QueryVersion is null;

    private static KpiPublicationState MapCatalogState(string mappingStatus) => mappingStatus switch
    {
        "Mapped-partial" => KpiPublicationState.Partial,
        "Listed-no-query" => KpiPublicationState.MappingIncomplete,
        "Not-in-KPI-doc" => KpiPublicationState.PendingDefinition,
        "Workflow-not-implemented" => KpiPublicationState.Unavailable,
        _ => KpiPublicationState.Unavailable
    };
}
