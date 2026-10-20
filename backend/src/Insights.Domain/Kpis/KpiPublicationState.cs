namespace Insights.Domain.Kpis;

/// <summary>
/// Distinct publication/display states. Missing data is never represented as zero.
/// </summary>
public enum KpiPublicationState
{
    Unavailable = 0,
    MappingIncomplete = 1,
    PendingDefinition = 2,
    PendingValidation = 3,
    Fresh = 4,
    Stale = 5,
    RefreshFailure = 6,
    Partial = 7
}
