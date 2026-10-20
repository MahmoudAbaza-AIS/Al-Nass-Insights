using Insights.Application.Abstractions;
using Insights.Application.Catalog;
using Insights.Application.Contracts;
using Insights.Application.Freshness;
using Insights.Application.Security;
using Insights.Domain.Kpis;

namespace Insights.Application.Kpis;

public sealed class GetKpiQuery(
    IAppCacheStore cache,
    IDataScopeAccessor scopeAccessor,
    IClock clock)
{
    public async Task<KpiDetailDto?> ExecuteAsync(string canonicalKpiId, CancellationToken cancellationToken)
    {
        var entry = KpiCatalog.FindByCanonical(canonicalKpiId);
        if (entry is null)
            return null;

        var dashboards = KpiCatalog.DashboardsForCanonical(canonicalKpiId);
        var scope = scopeAccessor.GetRequiredScope();
        if (!scope.CanAccessKpiOnDashboards(dashboards))
            throw new UnauthorizedAccessException($"KPI '{canonicalKpiId}' is outside the caller's data scope.");

        var published = await cache.GetLatestAsync(entry.CanonicalId, string.Empty, cancellationToken);
        if (published is null)
        {
            return new KpiDetailDto(
                entry.CanonicalId.Value,
                entry.DisplayName,
                MapAbsenceState(entry.MappingStatus),
                null, null, null,
                entry.Unit,
                entry.DefaultPeriod.Kind.ToString(),
                entry.QueryVersion,
                null, null,
                entry.Explanation ?? "No published cache value.",
                dashboards);
        }

        var state = FreshnessPolicy.ApplyStaleness(published.State, published.CapturedAt, entry.RefreshTier, clock.UtcNow);
        return new KpiDetailDto(
            entry.CanonicalId.Value,
            entry.DisplayName,
            state,
            published.Value,
            published.Numerator,
            published.Denominator,
            published.Unit ?? entry.Unit,
            entry.DefaultPeriod.Kind.ToString(),
            published.QueryVersion,
            published.CapturedAt,
            published.CapturedAt,
            published.Explanation ?? entry.Explanation,
            dashboards);
    }

    private static KpiPublicationState MapAbsenceState(string mappingStatus) => mappingStatus switch
    {
        "Listed-no-query" => KpiPublicationState.MappingIncomplete,
        "Not-in-KPI-doc" => KpiPublicationState.PendingDefinition,
        "Mapped-partial" => KpiPublicationState.Partial,
        _ => KpiPublicationState.Unavailable
    };
}
