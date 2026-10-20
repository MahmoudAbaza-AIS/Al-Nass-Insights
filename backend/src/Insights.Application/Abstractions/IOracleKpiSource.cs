using Insights.Domain.Kpis;

namespace Insights.Application.Abstractions;

/// <summary>
/// Read-only Oracle access used only by synchronization workflows — never by dashboard request handlers.
/// </summary>
public interface IOracleKpiSource
{
    Task<IReadOnlyList<SourceKpiObservation>> FetchApprovedQueriesAsync(
        IReadOnlyList<string> queryVersions,
        CancellationToken cancellationToken);
}

public sealed record SourceKpiObservation(
    CanonicalKpiId KpiId,
    string DimensionKey,
    decimal? Numerator,
    decimal? Denominator,
    decimal? Value,
    string? Unit,
    string QueryVersion,
    DateTimeOffset ObservedAt,
    KpiPublicationState SuggestedState,
    string? Explanation);
