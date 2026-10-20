using Insights.Application.Catalog;
using Insights.Application.Contracts;
using Insights.Domain.Dashboards;

namespace Insights.Application.Dashboards;

public static class DashboardCatalog
{
    private static readonly IReadOnlyDictionary<string, (string Name, string Area)> Meta =
        new Dictionary<string, (string, string)>(StringComparer.OrdinalIgnoreCase)
        {
            [DashboardIds.HospitalOverview] = ("Hospital Overview", "Overall hospital performance"),
            [DashboardIds.ClinicalPerformance] = ("Clinical Performance", "Clinical quality and outcomes"),
            [DashboardIds.OperatingRoom] = ("Operating Room Performance", "Operating room operations"),
            [DashboardIds.CallCenter] = ("Call Center Performance", "Contact center"),
            [DashboardIds.OutpatientClinic] = ("Outpatient Clinic Performance", "OPD operations"),
            [DashboardIds.Emergency] = ("Emergency Performance", "Emergency department"),
            [DashboardIds.InpatientServices] = ("Inpatient Services Performance", "Inpatient operations")
        };

    public static IReadOnlyList<DashboardSummaryDto> List() =>
        DashboardIds.All.Select(id =>
        {
            var (name, area) = Meta[id];
            return new DashboardSummaryDto(id, name, area, KpiCatalog.ForDashboard(id).Count);
        }).ToList();

    public static bool Exists(string dashboardId) => Meta.ContainsKey(dashboardId);

    public static (string Name, string Area) GetMeta(string dashboardId) => Meta[dashboardId];
}
