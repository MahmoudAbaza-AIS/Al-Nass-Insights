namespace Insights.Domain.Kpis;

public enum ReportingPeriodKind
{
    Unspecified = 0,
    Today = 1,
    MonthToDate = 2,
    Rolling30Days = 3,
    AllTime = 4,
    Custom = 5
}

public sealed record ReportingPeriod(
    ReportingPeriodKind Kind,
    string TimeZoneId,
    DateOnly? PeriodStart = null,
    DateOnly? PeriodEnd = null)
{
    public static ReportingPeriod Cairo(ReportingPeriodKind kind) =>
        new(kind, "Africa/Cairo");

    public static ReportingPeriod AllTimeCairo() =>
        Cairo(ReportingPeriodKind.AllTime);
}
