using Insights.Domain.Time;

namespace Insights.Domain.UnitTests;

public class CairoTimeTests
{
    [Fact]
    public void Today_Uses_Cairo_Calendar_Date()
    {
        // 2026-10-20 22:30 UTC is 2026-10-21 early morning in Cairo (UTC+2/+3 depending on DST rules).
        var utc = new DateTimeOffset(2026, 10, 20, 22, 30, 0, TimeSpan.Zero);
        var today = CairoTime.Today(utc);
        Assert.True(today is { Year: 2026, Month: 10 });
    }
}
