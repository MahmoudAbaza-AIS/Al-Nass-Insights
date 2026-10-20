using Insights.Application.Abstractions;
using Insights.Application.Dashboards;
using Insights.Application.Security;
using Insights.Domain.Dashboards;
using Insights.Domain.Kpis;
using Insights.Infrastructure.Persistence;
using NSubstitute;

namespace Insights.Application.UnitTests;

public class GetDashboardDetailQueryTests
{
    [Fact]
    public async Task Missing_Cache_Does_Not_Invent_Zero()
    {
        var cache = new InMemoryAppCacheStore();
        var scope = Substitute.For<IDataScopeAccessor>();
        scope.GetRequiredScope().Returns(new DataScope("Al Nass Hospital", new HashSet<string> { "*" }, new HashSet<string> { "executive" }));
        var clock = Substitute.For<IClock>();
        clock.UtcNow.Returns(DateTimeOffset.UtcNow);

        var sut = new GetDashboardDetailQuery(cache, scope, clock);
        var detail = await sut.ExecuteAsync(DashboardIds.HospitalOverview, CancellationToken.None);

        Assert.NotNull(detail);
        Assert.All(detail!.Widgets, w => Assert.Null(w.Value));
        Assert.Contains(detail.Widgets, w => w.ReviewId == "O-02");
    }
}
