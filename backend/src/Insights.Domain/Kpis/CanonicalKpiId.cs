namespace Insights.Domain.Kpis;

public readonly record struct CanonicalKpiId(string Value)
{
    public override string ToString() => Value;

    public static CanonicalKpiId Parse(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Canonical KPI id is required.", nameof(value));

        return new CanonicalKpiId(value.Trim());
    }
}
