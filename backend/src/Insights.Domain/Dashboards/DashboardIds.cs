namespace Insights.Domain.Dashboards;

public static class DashboardIds
{
    public const string HospitalOverview = "DASH-01";
    public const string ClinicalPerformance = "DASH-02";
    public const string OperatingRoom = "DASH-03";
    public const string CallCenter = "DASH-04";
    public const string OutpatientClinic = "DASH-05";
    public const string Emergency = "DASH-06";
    public const string InpatientServices = "DASH-07";

    public static readonly IReadOnlyList<string> All =
    [
        HospitalOverview,
        ClinicalPerformance,
        OperatingRoom,
        CallCenter,
        OutpatientClinic,
        Emergency,
        InpatientServices
    ];
}
