using Dapper;
using Insights.Application.Abstractions;
using Insights.Domain.Kpis;
using Insights.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Oracle.ManagedDataAccess.Client;

namespace Insights.Infrastructure.Sources.Oracle;

/// <summary>
/// Executes hospital-supplied query versions only. Does not invent period filters or alter business logic.
/// </summary>
public sealed class OracleKpiSource(
    IOptions<OracleSourceOptions> options,
    ILogger<OracleKpiSource> logger) : IOracleKpiSource
{
    public async Task<IReadOnlyList<SourceKpiObservation>> FetchApprovedQueriesAsync(
        IReadOnlyList<string> queryVersions,
        CancellationToken cancellationToken)
    {
        var opts = options.Value;
        if (!opts.Enabled || string.IsNullOrWhiteSpace(opts.ConnectionString))
        {
            logger.LogInformation("Oracle source disabled or not configured; returning no observations.");
            return [];
        }

        var results = new List<SourceKpiObservation>();
        await using var conn = new OracleConnection(opts.ConnectionString);
        await conn.OpenAsync(cancellationToken);

        foreach (var version in queryVersions.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (!OracleQueryPack.TryGet(version, out var query))
            {
                logger.LogWarning("Unknown Oracle query version {Version}; skipped.", version);
                continue;
            }

            try
            {
                var observations = await query.ExecuteAsync(conn, opts.CommandTimeoutSeconds, cancellationToken);
                results.AddRange(observations);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Oracle query {Version} failed.", version);
                throw;
            }
        }

        return results;
    }
}

internal static class OracleQueryPack
{
    private static readonly Dictionary<string, IOracleVersionedQuery> Queries =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["OQ-01@v1-2026-10-05"] = new ScalarQuery(
                "OQ-01@v1-2026-10-05",
                CanonicalKpiId.Parse("opd.appointment_lead_days"),
                "SELECT AVG(ABDATE - ABBKDT) AS AVG_DAYS FROM BMAPNBOK WHERE ABHSCD = '01'",
                "days",
                KpiPublicationState.PendingValidation,
                "All-time average; period/attendance filters not applied (hospital-supplied v1)."),
            ["OQ-02@v1-2026-10-05"] = new ScalarQuery(
                "OQ-02@v1-2026-10-05",
                CanonicalKpiId.Parse("opd.visits.attended"),
                "SELECT COUNT(ABMEDN) AS CNT FROM BMAPNBOK WHERE ABHSCD = '01' AND ABPTAK = 'E'",
                "count",
                KpiPublicationState.PendingValidation,
                "All-time attended visits; must not be labelled today until period filter approved."),
            ["OQ-03@v1-2026-10-05"] = new VisitsPerPhysicianQuery(),
            ["OQ-04@v1"] = new ScalarQuery(
                "OQ-04@v1",
                CanonicalKpiId.Parse("opd.appointment_performance"),
                "SELECT COUNT(ABMEDN) AS CNT FROM BMAPNBOK WHERE ABHSCD = '01' AND ABPTAK = 'N'",
                "count",
                KpiPublicationState.Partial,
                "No-show count only; on-time and cancellation segments unavailable."),
            ["OQ-05..08@v1"] = new ApplicationRequestQuery(),
            ["OQ-09@v1-2026-10-05"] = new ScalarQuery(
                "OQ-09@v1-2026-10-05",
                CanonicalKpiId.Parse("inpatient.alos_days"),
                "SELECT AVG(PADHDT - PAADDT) AS ALOS FROM ampatact WHERE PADHDT IS NOT NULL AND PAIOFG = 'I'",
                "days",
                KpiPublicationState.PendingValidation,
                "Hospital-code filter absent in supplied query; scope unconfirmed."),
            ["OQ-10@v1-2026-10-05"] = new ScalarQuery(
                "OQ-10@v1-2026-10-05",
                CanonicalKpiId.Parse("inpatient.admission_cancellation"),
                "SELECT COUNT(DAMEDN) AS CNT FROM AJDADMIT WHERE DASTUS = 'C' AND DAHSCD = '01'",
                "count",
                KpiPublicationState.Partial,
                "Cancellation count only; denominator required for rate.")
        };

    public static bool TryGet(string version, out IOracleVersionedQuery query) =>
        Queries.TryGetValue(version, out query!);
}

internal interface IOracleVersionedQuery
{
    Task<IReadOnlyList<SourceKpiObservation>> ExecuteAsync(
        OracleConnection connection,
        int timeoutSeconds,
        CancellationToken cancellationToken);
}

internal sealed class ScalarQuery(
    string version,
    CanonicalKpiId kpiId,
    string sql,
    string unit,
    KpiPublicationState state,
    string explanation) : IOracleVersionedQuery
{
    public async Task<IReadOnlyList<SourceKpiObservation>> ExecuteAsync(
        OracleConnection connection,
        int timeoutSeconds,
        CancellationToken cancellationToken)
    {
        var value = await connection.ExecuteScalarAsync<decimal?>(new CommandDefinition(
            sql,
            commandTimeout: timeoutSeconds,
            cancellationToken: cancellationToken));

        return
        [
            new SourceKpiObservation(
                kpiId,
                string.Empty,
                Numerator: value,
                Denominator: null,
                Value: value,
                unit,
                version,
                DateTimeOffset.UtcNow,
                state,
                explanation)
        ];
    }
}

internal sealed class VisitsPerPhysicianQuery : IOracleVersionedQuery
{
    public async Task<IReadOnlyList<SourceKpiObservation>> ExecuteAsync(
        OracleConnection connection,
        int timeoutSeconds,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT ABDRN, DMDRNL, COUNT(ABMEDN) AS CNT
            FROM BMAPNBOK, amdocmst
            WHERE ABHSCD = '01' AND ABPTAK = 'E' AND ABDRN = DMDRN
            GROUP BY ABDRN, DMDRNL
            """;

        var rows = (await connection.QueryAsync<(string Abdrn, string Dmdrnl, decimal Cnt)>(new CommandDefinition(
            sql,
            commandTimeout: timeoutSeconds,
            cancellationToken: cancellationToken))).ToList();

        // Aggregation to a single dashboard number is not approved — publish pending state without inventing average.
        return
        [
            new SourceKpiObservation(
                CanonicalKpiId.Parse("opd.visits_per_physician"),
                string.Empty,
                Numerator: rows.Count,
                Denominator: null,
                Value: null,
                Unit: "count",
                "OQ-03@v1-2026-10-05",
                DateTimeOffset.UtcNow,
                KpiPublicationState.PendingValidation,
                $"Grouped result returned {rows.Count} physicians; approved aggregation required before publishing a single value.")
        ];
    }
}

internal sealed class ApplicationRequestQuery : IOracleVersionedQuery
{
    public async Task<IReadOnlyList<SourceKpiObservation>> ExecuteAsync(
        OracleConnection connection,
        int timeoutSeconds,
        CancellationToken cancellationToken)
    {
        var total = await Scalar(connection, "SELECT COUNT(APPLICANTID) FROM MMAPRREQUEST", timeoutSeconds, cancellationToken);
        var approved = await Scalar(connection, "SELECT COUNT(APPLICANTID) FROM MMAPRREQUEST WHERE STATUS IN (5,3,4)", timeoutSeconds, cancellationToken);
        var rejected = await Scalar(connection, "SELECT COUNT(APPLICANTID) FROM MMAPRREQUEST WHERE STATUS IN (2)", timeoutSeconds, cancellationToken);
        var waiting = await Scalar(connection, "SELECT COUNT(APPLICANTID) FROM MMAPRREQUEST WHERE STATUS IN (1,6)", timeoutSeconds, cancellationToken);
        var mapped = (approved ?? 0) + (rejected ?? 0) + (waiting ?? 0);
        var unknown = (total ?? 0) - mapped;

        return
        [
            new SourceKpiObservation(
                CanonicalKpiId.Parse("application_request.outcome_split"),
                string.Empty,
                Numerator: mapped,
                Denominator: total,
                Value: total,
                Unit: "count",
                "OQ-05..08@v1",
                DateTimeOffset.UtcNow,
                KpiPublicationState.PendingValidation,
                $"Approved={approved}; Rejected={rejected}; Waiting={waiting}; UnmappedStatusCount={unknown}. Denominator classification requires hospital agreement.")
        ];
    }

    private static Task<decimal?> Scalar(OracleConnection conn, string sql, int timeout, CancellationToken ct) =>
        conn.ExecuteScalarAsync<decimal?>(new CommandDefinition(sql, commandTimeout: timeout, cancellationToken: ct));
}
