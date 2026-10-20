using Insights.Application.Contracts;
using Insights.Application.Security;

namespace Insights.Application.Dashboards;

public sealed class GetDashboardsQuery(IDataScopeAccessor scopeAccessor)
{
    public IReadOnlyList<DashboardSummaryDto> Execute()
    {
        var scope = scopeAccessor.GetRequiredScope();
        return DashboardCatalog.List()
            .Where(d => scope.CanAccessDashboard(d.DashboardId))
            .ToList();
    }
}
