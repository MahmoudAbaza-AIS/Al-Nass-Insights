using Insights.Application.Catalog;
using Insights.Domain.Dashboards;

namespace Insights.Application.UnitTests;

public class KpiCatalogTests
{
    [Fact]
    public void Catalog_Contains_Sixty_Nine_Widget_Entries()
    {
        Assert.Equal(69, KpiCatalog.All.Count);
    }

    [Fact]
    public void Shared_Opd_Visits_Use_Same_Canonical_Id()
    {
        var o02 = KpiCatalog.FindByReviewId("O-02");
        var p01 = KpiCatalog.FindByReviewId("P-01");

        Assert.NotNull(o02);
        Assert.NotNull(p01);
        Assert.Equal(o02!.CanonicalId.Value, p01!.CanonicalId.Value);
        Assert.Equal(DashboardIds.HospitalOverview, o02.DashboardId);
        Assert.Equal(DashboardIds.OutpatientClinic, p01.DashboardId);
    }

    [Fact]
    public void Dashboards_Cover_All_Seven_Modules()
    {
        foreach (var id in DashboardIds.All)
            Assert.NotEmpty(KpiCatalog.ForDashboard(id));
    }
}
