using Insights.Domain.Dashboards;
using Insights.Domain.Kpis;

namespace Insights.Application.Catalog;

public static class KpiCatalog
{
    private static readonly IReadOnlyList<KpiCatalogEntry> Entries = Build();

    public static IReadOnlyList<KpiCatalogEntry> All => Entries;

    public static IReadOnlyList<KpiCatalogEntry> ForDashboard(string dashboardId) =>
        Entries.Where(e => e.DashboardId.Equals(dashboardId, StringComparison.OrdinalIgnoreCase)).ToList();

    public static KpiCatalogEntry? FindByCanonical(string canonicalId) =>
        Entries.FirstOrDefault(e => e.CanonicalId.Value.Equals(canonicalId, StringComparison.OrdinalIgnoreCase));

    public static KpiCatalogEntry? FindByReviewId(string reviewId) =>
        Entries.FirstOrDefault(e => e.ReviewId.Equals(reviewId, StringComparison.OrdinalIgnoreCase));

    public static IReadOnlyList<string> DashboardsForCanonical(string canonicalId) =>
        Entries
            .Where(e => e.CanonicalId.Value.Equals(canonicalId, StringComparison.OrdinalIgnoreCase))
            .Select(e => e.DashboardId)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

    private static IReadOnlyList<KpiCatalogEntry> Build()
    {
        var list = new List<KpiCatalogEntry>();

        void Add(
            string reviewId,
            string canonical,
            string dashboard,
            string name,
            string mapping,
            RefreshTier tier,
            ReportingPeriodKind period,
            string? unit = null,
            string? queryVersion = null,
            string? source = null,
            string? explanation = null,
            string[]? sharedWith = null)
        {
            list.Add(new KpiCatalogEntry
            {
                ReviewId = reviewId,
                CanonicalId = CanonicalKpiId.Parse(canonical),
                DashboardId = dashboard,
                DisplayName = name,
                MappingStatus = mapping,
                RefreshTier = tier,
                DefaultPeriod = ReportingPeriod.Cairo(period),
                Unit = unit,
                QueryVersion = queryVersion,
                SourceSystem = source,
                Explanation = explanation,
                SharedWithReviewIds = sharedWith ?? []
            });
        }

        // DASH-01
        Add("O-01", "er.visits.total", DashboardIds.HospitalOverview, "Total ER Visits", "Not-in-KPI-doc", RefreshTier.Tier2Intraday, ReportingPeriodKind.Today, explanation: "No source row; ER workflow not implemented.");
        Add("O-02", "opd.visits.attended", DashboardIds.HospitalOverview, "Total OPD Visits", "Mapped-full", RefreshTier.Tier2Intraday, ReportingPeriodKind.AllTime, unit: "count", queryVersion: "OQ-02@v1-2026-10-05", source: "Oracle", explanation: "All-time count until period filter approved.", sharedWith: ["P-01"]);
        Add("O-03", "application_request.outcome_split", DashboardIds.HospitalOverview, "Application Request", "Mapped-full", RefreshTier.Tier3Operational, ReportingPeriodKind.AllTime, unit: "percent", queryVersion: "OQ-05..08@v1", source: "Oracle", explanation: "102 STATUS values outside supplied groups require denominator agreement.");
        Add("O-04", "or.utilization_rate", DashboardIds.HospitalOverview, "OR Utilization Rate", "Workflow-not-implemented", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "%", sharedWith: ["R-01"]);
        Add("O-05", "opd.appointment_performance", DashboardIds.HospitalOverview, "Outpatient clinics performance", "Mapped-partial", RefreshTier.Tier3Operational, ReportingPeriodKind.AllTime, unit: "%", queryVersion: "OQ-04@v1", source: "Oracle", explanation: "Only no-show count supplied.", sharedWith: ["P-09"]);
        Add("O-06", "callcenter.inbound_outbound_share", DashboardIds.HospitalOverview, "Call Center Inbound/Outbound", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Unspecified, unit: "%");
        Add("O-07", "er.door_to_doctor_minutes", DashboardIds.HospitalOverview, "Door-to-Doctor Time", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Unspecified, unit: "min", sharedWith: ["E-06"]);
        Add("O-08", "inpatient.bed_occupancy_rate", DashboardIds.HospitalOverview, "Bed Occupancy Rate", "Listed-no-query", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "%", sharedWith: ["I-01"]);
        Add("O-09", "clinical.recovery_rate", DashboardIds.HospitalOverview, "Recovery Rate", "Not-in-KPI-doc", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified, unit: "%", sharedWith: ["C-10"]);

        // DASH-02 Clinical (definitions unapproved)
        AddClinical("C-01", "clinical.pressure_ulcer_rate", "Pressure Ulcer Rate");
        AddClinical("C-02", "clinical.adverse_events_rate", "Adverse Events Rate");
        AddClinical("C-03", "clinical.missed_diagnosis_rate", "Missed Diagnosis Rate");
        AddClinical("C-04", "clinical.vte_compliance", "VTE Compliance");
        AddClinical("C-05", "clinical.falls_rate", "Falls Rate");
        AddClinical("C-06", "clinical.ventilator_utilization", "Ventilator Utilization");
        AddClinical("C-07", "clinical.ventilator_days", "Ventilator Days");
        AddClinical("C-08", "clinical.extubation_failure", "Extubation Failure");
        AddClinical("C-09", "clinical.reintubation_48h", "Reintubation (48h)");
        Add("C-10", "clinical.recovery_rate", DashboardIds.ClinicalPerformance, "Recovery Rate", "Not-in-KPI-doc", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified, unit: "%", explanation: "Definition missing; history required for sparkline.", sharedWith: ["O-09"]);
        AddClinical("C-11", "clinical.complication_rate", "Complication Rate");
        AddClinical("C-12", "clinical.mortality_rate", "Mortality Rate");
        AddClinical("C-13", "clinical.med_turnaround_minutes", "Medication Turnaround Time");
        AddClinical("C-14", "clinical.near_miss", "Near Miss");
        AddClinical("C-15", "clinical.medication_error", "Medication Error");
        Add("C-16", "or.ssi_rate", DashboardIds.ClinicalPerformance, "SSI Rate", "Workflow-not-implemented", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified, unit: "%", sharedWith: ["R-06"]);
        AddClinical("C-17", "clinical.cauti_rate", "CAUTI Rate");
        AddClinical("C-18", "clinical.clabsi_rate", "CLABSI Rate");
        AddClinical("C-19", "clinical.vap_rate", "VAP Rate");

        void AddClinical(string reviewId, string canonical, string name) =>
            Add(reviewId, canonical, DashboardIds.ClinicalPerformance, name, "Not-in-KPI-doc", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified,
                explanation: "Absent from KPI document; hospital owner/definition/source required.");

        // DASH-03 OR
        Add("R-01", "or.utilization_rate", DashboardIds.OperatingRoom, "OR Utilization Rate", "Workflow-not-implemented", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "%", sharedWith: ["O-04"]);
        Add("R-02", "or.first_case_ontime", DashboardIds.OperatingRoom, "First Case On-Time Start", "Workflow-not-implemented", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "%");
        Add("R-03", "or.turnover_minutes", DashboardIds.OperatingRoom, "Turnover Time", "Workflow-not-implemented", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "min");
        Add("R-04", "or.cancellation_rate", DashboardIds.OperatingRoom, "OR Cancellation Rate", "Workflow-not-implemented", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "%");
        Add("R-05", "or.postop_complication_rate", DashboardIds.OperatingRoom, "Postoperative Complication Rate", "Workflow-not-implemented", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified, unit: "%");
        Add("R-06", "or.ssi_rate", DashboardIds.OperatingRoom, "Surgical Site Infection Rate", "Workflow-not-implemented", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified, unit: "%", sharedWith: ["C-16"]);
        Add("R-07", "or.daily_surgeries_cath", DashboardIds.OperatingRoom, "Daily No of surgeries & cath", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Today, unit: "count");
        Add("R-08", "or.reoperation_rate", DashboardIds.OperatingRoom, "Reoperation Rate", "Workflow-not-implemented", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified, unit: "%");
        Add("R-09", "or.room_count", DashboardIds.OperatingRoom, "Total ORs", "Not-in-KPI-doc", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "count");
        Add("R-10", "or.active_idle_status", DashboardIds.OperatingRoom, "Active/Idle ORs", "Not-in-KPI-doc", RefreshTier.Tier1LiveStatus, ReportingPeriodKind.Unspecified);

        // DASH-04 Call Center
        Add("CC-01", "callcenter.volume_total", DashboardIds.CallCenter, "Total Call Volume", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Unspecified, unit: "count");
        Add("CC-02", "callcenter.service_level_20s", DashboardIds.CallCenter, "Service Level", "Workflow-not-implemented", RefreshTier.Tier1LiveStatus, ReportingPeriodKind.Unspecified, unit: "%");
        Add("CC-03", "callcenter.aht", DashboardIds.CallCenter, "Average Handle Time", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Unspecified, unit: "mm:ss");
        Add("CC-04", "callcenter.abandoned_rate", DashboardIds.CallCenter, "Abandoned Calls", "Workflow-not-implemented", RefreshTier.Tier1LiveStatus, ReportingPeriodKind.Unspecified, unit: "%");
        Add("CC-05", "callcenter.volume_by_day", DashboardIds.CallCenter, "Call Volume Overview", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Unspecified);
        Add("CC-06", "callcenter.abandon_trend", DashboardIds.CallCenter, "Abandon Rate trend", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Unspecified);

        // DASH-05 OPD
        Add("P-01", "opd.visits.attended", DashboardIds.OutpatientClinic, "Total OPD Visits", "Mapped-full", RefreshTier.Tier2Intraday, ReportingPeriodKind.AllTime, unit: "count", queryVersion: "OQ-02@v1-2026-10-05", source: "Oracle", sharedWith: ["O-02"]);
        Add("P-02", "opd.referral_rate", DashboardIds.OutpatientClinic, "Referral", "Listed-no-query", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "%");
        Add("P-03", "opd.appointment_lead_days", DashboardIds.OutpatientClinic, "Appointment Lead Time", "Mapped-full", RefreshTier.Tier3Operational, ReportingPeriodKind.AllTime, unit: "days", queryVersion: "OQ-01@v1-2026-10-05", source: "Oracle", explanation: "Includes cancelled/no-show until filter approved.");
        Add("P-04", "opd.clinic_utilization", DashboardIds.OutpatientClinic, "Clinic Utilization", "Listed-no-query", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "%");
        Add("P-05", "opd.visits_per_physician", DashboardIds.OutpatientClinic, "Visits per Physician", "Mapped-full", RefreshTier.Tier3Operational, ReportingPeriodKind.AllTime, unit: "count", queryVersion: "OQ-03@v1-2026-10-05", source: "Oracle", explanation: "Grouped rows; aggregation rule not approved.");
        Add("P-06", "opd.waiting_minutes", DashboardIds.OutpatientClinic, "Waiting Time", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Unspecified, unit: "min");
        Add("P-07", "opd.followup_compliance", DashboardIds.OutpatientClinic, "Follow-up Compliance", "Listed-no-query", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "%");
        Add("P-08", "opd.consultation_minutes", DashboardIds.OutpatientClinic, "Consultation Time", "Listed-no-query", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "min");
        Add("P-09", "opd.appointment_performance", DashboardIds.OutpatientClinic, "Appointment Performance", "Mapped-partial", RefreshTier.Tier3Operational, ReportingPeriodKind.AllTime, unit: "%", queryVersion: "OQ-04@v1", source: "Oracle", sharedWith: ["O-05"]);

        // DASH-06 ER
        Add("E-01", "er.visits.total", DashboardIds.Emergency, "Total ER Visits", "Not-in-KPI-doc", RefreshTier.Tier2Intraday, ReportingPeriodKind.Today, sharedWith: ["O-01"]);
        Add("E-02", "er.admitted_count", DashboardIds.Emergency, "Patients Admitted", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Today, unit: "count");
        Add("E-03", "er.discharged_home_count", DashboardIds.Emergency, "Patients Discharged to Home", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Today, unit: "count");
        Add("E-04", "er.referred_out_count", DashboardIds.Emergency, "Patients Referred to Another Hospital", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Today, unit: "count");
        Add("E-05", "er.lwbs_count", DashboardIds.Emergency, "Left Without Being Seen", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Today, unit: "count");
        Add("E-06", "er.door_to_doctor_minutes", DashboardIds.Emergency, "Door to Doctor Time", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Unspecified, unit: "min", sharedWith: ["O-07"]);
        Add("E-07", "er.length_of_stay", DashboardIds.Emergency, "Length of Stay in ER", "Workflow-not-implemented", RefreshTier.Tier2Intraday, ReportingPeriodKind.Unspecified, unit: "hours");

        // DASH-07 Inpatient
        Add("I-01", "inpatient.bed_occupancy_rate", DashboardIds.InpatientServices, "Bed Occupancy", "Listed-no-query", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified, unit: "%", sharedWith: ["O-08"]);
        Add("I-02", "inpatient.alos_days", DashboardIds.InpatientServices, "Average Length of Stay", "Mapped-full", RefreshTier.Tier3Operational, ReportingPeriodKind.AllTime, unit: "days", queryVersion: "OQ-09@v1-2026-10-05", source: "Oracle", explanation: "No hospital-code filter in supplied query; scope unconfirmed.");
        Add("I-03", "inpatient.bed_turnover", DashboardIds.InpatientServices, "Bed Turnover", "Listed-no-query", RefreshTier.Tier3Operational, ReportingPeriodKind.Unspecified);
        Add("I-04", "inpatient.admission_cancellation", DashboardIds.InpatientServices, "Admission Cancellation Rate", "Mapped-partial", RefreshTier.Tier3Operational, ReportingPeriodKind.AllTime, unit: "count", queryVersion: "OQ-10@v1-2026-10-05", source: "Oracle", explanation: "Count only; denominator required for rate.");
        Add("I-05", "inpatient.bed_capacity", DashboardIds.InpatientServices, "Bed Capacity", "Not-in-KPI-doc", RefreshTier.Tier1LiveStatus, ReportingPeriodKind.Unspecified);
        Add("I-06", "inpatient.readmission_rate", DashboardIds.InpatientServices, "Readmission Rate", "Listed-no-query", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified, unit: "%");
        Add("I-07", "inpatient.satisfaction", DashboardIds.InpatientServices, "Patient Satisfaction Score", "Listed-no-query", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified);
        Add("I-08", "inpatient.complaint_rate", DashboardIds.InpatientServices, "Complaint Rate", "Workflow-not-implemented", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified, unit: "%");
        Add("I-09", "inpatient.violation_rate", DashboardIds.InpatientServices, "Patient Violation Rate", "Workflow-not-implemented", RefreshTier.Tier4QualityDaily, ReportingPeriodKind.Unspecified, unit: "%");

        return list;
    }
}
