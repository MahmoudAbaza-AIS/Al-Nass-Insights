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
}
