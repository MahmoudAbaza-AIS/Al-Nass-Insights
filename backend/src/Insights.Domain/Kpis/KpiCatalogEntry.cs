namespace Insights.Domain.Kpis;

public sealed class KpiCatalogEntry
{
    public required CanonicalKpiId CanonicalId { get; init; }
    public required string ReviewId { get; init; }
    public required string DashboardId { get; init; }
    public required string DisplayName { get; init; }
    public required string MappingStatus { get; init; }
    public required RefreshTier RefreshTier { get; init; }
    public required ReportingPeriod DefaultPeriod { get; init; }
    public string? Unit { get; init; }
    public string? QueryVersion { get; init; }
    public string? SourceSystem { get; init; }
    public string? Explanation { get; init; }
    public IReadOnlyList<string> SharedWithReviewIds { get; init; } = [];
}
