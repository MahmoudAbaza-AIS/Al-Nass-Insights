using Insights.Domain.Kpis;

namespace Insights.Application.Contracts;

public sealed record DashboardSummaryDto(
    string DashboardId,
    string Name,
    string BusinessArea,
    int WidgetCount);

public sealed record DashboardDetailDto(
    string DashboardId,
    string Name,
    string BusinessArea,
    DateTimeOffset? DataAsOf,
    DateTimeOffset? LastSuccessfulRefresh,
    IReadOnlyList<WidgetDto> Widgets);

public sealed record WidgetDto(
    string ReviewId,
    string CanonicalKpiId,
    string DisplayName,
    KpiPublicationState State,
    decimal? Value,
    string? Unit,
    string? Period,
    DateTimeOffset? DataAsOf,
    string? Explanation,
    bool IsPartial);

public sealed record KpiDetailDto(
    string CanonicalKpiId,
    string DisplayName,
    KpiPublicationState State,
    decimal? Value,
    decimal? Numerator,
    decimal? Denominator,
    string? Unit,
    string? Period,
    string? QueryVersion,
    DateTimeOffset? DataAsOf,
    DateTimeOffset? LastSuccessfulRefresh,
    string? Explanation,
    IReadOnlyList<string> AppearsOnDashboards);

public sealed record KpiHistoryPointDto(
    DateOnly PeriodStart,
    decimal? Value,
    decimal? Numerator,
    decimal? Denominator,
    KpiPublicationState State,
    DateTimeOffset CapturedAt);

public sealed record SymbolDto(
    string SymbolId,
    string Name,
    string? Category,
    DateTimeOffset CapturedAt,
    string SourceVersion);
