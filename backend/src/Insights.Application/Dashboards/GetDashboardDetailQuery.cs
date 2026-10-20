using Insights.Application.Abstractions;
using Insights.Application.Catalog;
using Insights.Application.Contracts;
using Insights.Application.Freshness;
using Insights.Application.Security;
using Insights.Domain.Kpis;

namespace Insights.Application.Dashboards;

public sealed class GetDashboardDetailQuery(
    IAppCacheStore cache,
    IDataScopeAccessor scopeAccessor,
    IClock clock)
{
    public async Task<DashboardDetailDto?> ExecuteAsync(string dashboardId, CancellationToken cancellationToken)
    {
        if (!DashboardCatalog.Exists(dashboardId))
            return null;

        var scope = scopeAccessor.GetRequiredScope();
        if (!scope.CanAccessDashboard(dashboardId))
            throw new UnauthorizedAccessException($"Dashboard '{dashboardId}' is not in the caller's data scope.");

        var (name, area) = DashboardCatalog.GetMeta(dashboardId);
        var entries = KpiCatalog.ForDashboard(dashboardId);
        var widgets = new List<WidgetDto>();
        DateTimeOffset? dataAsOf = null;
        DateTimeOffset? lastSuccess = null;

        foreach (var entry in entries)
        {
            var published = await cache.GetLatestAsync(entry.CanonicalId, string.Empty, cancellationToken);
            var widget = MapWidget(entry, published, clock.UtcNow);
            widgets.Add(widget);

            if (widget.DataAsOf is { } asOf)
            {
                dataAsOf = dataAsOf is null || asOf > dataAsOf ? asOf : dataAsOf;
                if (widget.State is KpiPublicationState.Fresh or KpiPublicationState.Stale or KpiPublicationState.Partial or KpiPublicationState.PendingValidation)
                    lastSuccess = lastSuccess is null || asOf > lastSuccess ? asOf : lastSuccess;
            }
        }

        return new DashboardDetailDto(dashboardId, name, area, dataAsOf, lastSuccess, widgets);
    }

    private static WidgetDto MapWidget(KpiCatalogEntry entry, KpiValue? published, DateTimeOffset utcNow)
    {
        if (published is null)
        {
            var state = entry.MappingStatus switch
            {
                "Mapped-full" or "Mapped-partial" => KpiPublicationState.Unavailable,
                "Listed-no-query" => KpiPublicationState.MappingIncomplete,
                "Not-in-KPI-doc" => KpiPublicationState.PendingDefinition,
                "Workflow-not-implemented" => KpiPublicationState.Unavailable,
                _ => KpiPublicationState.Unavailable
            };

            return new WidgetDto(
                entry.ReviewId,
                entry.CanonicalId.Value,
                entry.DisplayName,
                state,
                Value: null,
                entry.Unit,
                entry.DefaultPeriod.Kind.ToString(),
                DataAsOf: null,
                entry.Explanation ?? "No published cache value.",
                IsPartial: entry.MappingStatus == "Mapped-partial");
        }

        var effective = FreshnessPolicy.ApplyStaleness(published.State, published.CapturedAt, entry.RefreshTier, utcNow);
        return new WidgetDto(
            entry.ReviewId,
            entry.CanonicalId.Value,
            entry.DisplayName,
            effective,
            published.Value,
            published.Unit ?? entry.Unit,
            entry.DefaultPeriod.Kind.ToString(),
            published.CapturedAt,
            published.Explanation ?? entry.Explanation,
            IsPartial: effective == KpiPublicationState.Partial || entry.MappingStatus == "Mapped-partial");
    }
}
