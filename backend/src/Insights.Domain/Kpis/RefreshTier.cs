namespace Insights.Domain.Kpis;

/// <summary>
/// Documented default is Tier3 (6 hours). Faster tiers require hospital/DBA approval before activation.
/// </summary>
public enum RefreshTier
{
    Tier1LiveStatus = 1,
    Tier2Intraday = 2,
    Tier3Operational = 3,
    Tier4QualityDaily = 4
}
