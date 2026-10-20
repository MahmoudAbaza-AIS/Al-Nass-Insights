namespace Insights.Domain.Kpis;

/// <summary>
/// Aggregated published value only — never patient-identifiable records.
/// </summary>
public sealed class KpiValue
{
    public required CanonicalKpiId KpiId { get; init; }
    public required KpiGrain Grain { get; init; }
    public required DateOnly PeriodStart { get; init; }
    public string DimensionKey { get; init; } = string.Empty;
    public decimal? Numerator { get; init; }
    public decimal? Denominator { get; init; }
    public decimal? Value { get; init; }
    public string? Unit { get; init; }
    public bool IsFinal { get; init; }
    public required DateTimeOffset CapturedAt { get; init; }
    public required string QueryVersion { get; init; }
    public required long SyncRunId { get; init; }
    public required KpiPublicationState State { get; init; }
    public string? Explanation { get; init; }

    public static KpiValue Unavailable(CanonicalKpiId kpiId, string explanation, DateTimeOffset asOf) =>
        new()
        {
            KpiId = kpiId,
            Grain = KpiGrain.Snapshot,
            PeriodStart = DateOnly.FromDateTime(asOf.UtcDateTime),
            CapturedAt = asOf,
            QueryVersion = "n/a",
            SyncRunId = 0,
            State = KpiPublicationState.Unavailable,
            Explanation = explanation
        };

    /// <summary>
    /// Genuine zero is allowed only when a successful sync published an explicit numeric zero.
    /// </summary>
    public static bool IsGenuineZero(KpiValue value) =>
        value.State is KpiPublicationState.Fresh or KpiPublicationState.Stale or KpiPublicationState.PendingValidation
        && value.Value == 0m;
}
