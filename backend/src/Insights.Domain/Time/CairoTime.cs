namespace Insights.Domain.Time;

public static class CairoTime
{
    public const string TimeZoneId = "Africa/Cairo";

    public static TimeZoneInfo GetTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(TimeZoneId);
        }
        catch (TimeZoneNotFoundException)
        {
            // Windows may use a different id historically; try common alternate.
            return TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
        }
    }

    public static DateOnly Today(DateTimeOffset utcNow)
    {
        var local = TimeZoneInfo.ConvertTime(utcNow, GetTimeZone());
        return DateOnly.FromDateTime(local.DateTime);
    }

    public static DateTimeOffset StartOfLocalDay(DateOnly day)
    {
        var tz = GetTimeZone();
        var unspecified = day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified);
        var offset = tz.GetUtcOffset(unspecified);
        return new DateTimeOffset(unspecified, offset);
    }
}
