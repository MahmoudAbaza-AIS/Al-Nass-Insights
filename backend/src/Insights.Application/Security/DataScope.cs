namespace Insights.Application.Security;

public sealed record DataScope(
    string Organization,
    IReadOnlySet<string> AllowedDashboards,
    IReadOnlySet<string> Roles)
{
    public bool CanAccessDashboard(string dashboardId) =>
        AllowedDashboards.Contains("*") || AllowedDashboards.Contains(dashboardId, StringComparer.OrdinalIgnoreCase);

    public bool CanAccessKpiOnDashboards(IEnumerable<string> dashboardIds) =>
        dashboardIds.Any(CanAccessDashboard);
}
