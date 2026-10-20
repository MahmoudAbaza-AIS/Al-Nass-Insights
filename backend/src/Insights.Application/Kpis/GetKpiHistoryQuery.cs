using Insights.Application.Abstractions;
using Insights.Application.Catalog;
using Insights.Application.Contracts;
using Insights.Application.Security;
using Insights.Domain.Kpis;

namespace Insights.Application.Kpis;

public sealed class GetKpiHistoryQuery(
    IAppCacheStore cache,
    IDataScopeAccessor scopeAccessor)
{
    private const int MaxDays = 400;

    public async Task<IReadOnlyList<KpiHistoryPointDto>?> ExecuteAsync(
        string canonicalKpiId,
        DateOnly fromInclusive,
        DateOnly toInclusive,
        CancellationToken cancellationToken)
    {
        var entry = KpiCatalog.FindByCanonical(canonicalKpiId);
        if (entry is null)
            return null;

        var dashboards = KpiCatalog.DashboardsForCanonical(canonicalKpiId);
        var scope = scopeAccessor.GetRequiredScope();
        if (!scope.CanAccessKpiOnDashboards(dashboards))
            throw new UnauthorizedAccessException($"KPI '{canonicalKpiId}' is outside the caller's data scope.");

        if (toInclusive < fromInclusive)
            throw new ArgumentException("toInclusive must be on or after fromInclusive.");

        if (toInclusive.DayNumber - fromInclusive.DayNumber > MaxDays)
            throw new ArgumentOutOfRangeException(nameof(toInclusive), $"History window cannot exceed {MaxDays} days.");

        var rows = await cache.GetHistoryAsync(CanonicalKpiId.Parse(canonicalKpiId), fromInclusive, toInclusive, cancellationToken);
        return rows.Select(r => new KpiHistoryPointDto(
            r.PeriodStart,
            r.Value,
            r.Numerator,
            r.Denominator,
            r.State,
            r.CapturedAt)).ToList();
    }
}
