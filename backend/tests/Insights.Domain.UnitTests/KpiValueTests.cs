using Insights.Domain.Kpis;

namespace Insights.Domain.UnitTests;

public class KpiValueTests
{
    [Fact]
    public void Unavailable_Does_Not_Set_Zero_Value()
    {
        var value = KpiValue.Unavailable(CanonicalKpiId.Parse("opd.visits.attended"), "no source", DateTimeOffset.UtcNow);

        Assert.Null(value.Value);
        Assert.Equal(KpiPublicationState.Unavailable, value.State);
        Assert.False(KpiValue.IsGenuineZero(value));
    }

    [Fact]
    public void Genuine_Zero_Requires_Published_Numeric_Zero()
    {
        var zero = new KpiValue
        {
            KpiId = CanonicalKpiId.Parse("x"),
            Grain = KpiGrain.Day,
            PeriodStart = DateOnly.FromDateTime(DateTime.UtcNow),
            Value = 0m,
            CapturedAt = DateTimeOffset.UtcNow,
            QueryVersion = "t",
            SyncRunId = 1,
            State = KpiPublicationState.Fresh
        };

        Assert.True(KpiValue.IsGenuineZero(zero));
    }
}
