using Insights.Domain.Kpis;

namespace Insights.Application.Freshness;

public static class FreshnessPolicy
{
    /// <summary>
    /// Stale after two missed intervals of the KPI's refresh tier.
    /// </summary>
    public static TimeSpan MaxAge(RefreshTier tier) => tier switch
    {
        RefreshTier.Tier1LiveStatus => TimeSpan.FromMinutes(10),
        RefreshTier.Tier2Intraday => TimeSpan.FromMinutes(60),
        RefreshTier.Tier3Operational => TimeSpan.FromHours(12),
        RefreshTier.Tier4QualityDaily => TimeSpan.FromHours(48),
        _ => TimeSpan.FromHours(12)
    };

    public static TimeSpan Interval(RefreshTier tier) => tier switch
    {
        RefreshTier.Tier1LiveStatus => TimeSpan.FromMinutes(5),
        RefreshTier.Tier2Intraday => TimeSpan.FromMinutes(30),
        RefreshTier.Tier3Operational => TimeSpan.FromHours(6),
        RefreshTier.Tier4QualityDaily => TimeSpan.FromHours(24),
        _ => TimeSpan.FromHours(6)
    };

    public static KpiPublicationState ApplyStaleness(
        KpiPublicationState current,
        DateTimeOffset capturedAt,
        RefreshTier tier,
        DateTimeOffset utcNow)
    {
        if (current is KpiPublicationState.Unavailable
            or KpiPublicationState.MappingIncomplete
            or KpiPublicationState.PendingDefinition
            or KpiPublicationState.RefreshFailure)
        {
            return current;
        }

        if (utcNow - capturedAt > MaxAge(tier))
            return KpiPublicationState.Stale;

        return current;
    }
}
