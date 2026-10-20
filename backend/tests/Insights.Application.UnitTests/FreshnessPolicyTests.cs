using Insights.Application.Freshness;
using Insights.Domain.Kpis;

namespace Insights.Application.UnitTests;

public class FreshnessPolicyTests
{
    [Fact]
    public void Fresh_Becomes_Stale_After_Two_Missed_Tier3_Intervals()
    {
        var captured = DateTimeOffset.Parse("2026-10-20T00:00:00Z");
        var now = captured.AddHours(13);
        var state = FreshnessPolicy.ApplyStaleness(KpiPublicationState.Fresh, captured, RefreshTier.Tier3Operational, now);
        Assert.Equal(KpiPublicationState.Stale, state);
    }

    [Fact]
    public void Unavailable_Is_Not_Relabeled_Stale()
    {
        var state = FreshnessPolicy.ApplyStaleness(
            KpiPublicationState.Unavailable,
            DateTimeOffset.UtcNow.AddDays(-2),
            RefreshTier.Tier3Operational,
            DateTimeOffset.UtcNow);
        Assert.Equal(KpiPublicationState.Unavailable, state);
    }
}
