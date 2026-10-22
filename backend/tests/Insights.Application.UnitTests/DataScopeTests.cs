using Insights.Application.Security;
using Insights.Domain.Dashboards;

namespace Insights.Application.UnitTests;

public class DataScopeTests
{
    [Fact]
    public void Organization_Isolation_Denies_Unlisted_Dashboard()
    {
        var scope = new DataScope(
            "Advansys-IS",
            new HashSet<string> { DashboardIds.HospitalOverview },
            new HashSet<string> { "viewer" });

        Assert.True(scope.CanAccessDashboard(DashboardIds.HospitalOverview));
        Assert.False(scope.CanAccessDashboard(DashboardIds.ClinicalPerformance));
    }

    [Fact]
    public void Empty_Dashboard_Set_Denies_All_Dashboards()
    {
        var scope = new DataScope(
            "Al Nass Hospital",
            new HashSet<string>(StringComparer.OrdinalIgnoreCase),
            new HashSet<string> { "viewer" });

        Assert.False(scope.CanAccessDashboard(DashboardIds.HospitalOverview));
        Assert.False(scope.CanAccessDashboard(DashboardIds.ClinicalPerformance));
        Assert.False(scope.CanAccessDashboard("*"));
    }

    [Fact]
    public void Wildcard_Allows_Any_Dashboard()
    {
        var scope = new DataScope(
            "Al Nass Hospital",
            new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "*" },
            new HashSet<string> { "executive" });

        Assert.True(scope.CanAccessDashboard(DashboardIds.HospitalOverview));
        Assert.True(scope.CanAccessDashboard(DashboardIds.InpatientServices));
    }
}
