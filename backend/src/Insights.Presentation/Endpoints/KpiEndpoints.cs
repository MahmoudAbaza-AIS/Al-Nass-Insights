using Insights.Application.Kpis;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Insights.Presentation.Endpoints;

public static class KpiEndpoints
{
    public static RouteGroupBuilder MapKpiEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/kpis")
            .WithTags("KPIs")
            .RequireAuthorization();

        group.MapGet("/{canonicalKpiId}", GetKpi)
            .WithName("GetKpi")
            .WithSummary("Get a published canonical KPI from the application cache.");

        group.MapGet("/{canonicalKpiId}/history", GetHistory)
            .WithName("GetKpiHistory")
            .WithSummary("Get bounded KPI history from the application cache.");

        return group;
    }

    private static async Task<Results<Ok<Insights.Application.Contracts.KpiDetailDto>, NotFound, ProblemHttpResult>> GetKpi(
        string canonicalKpiId,
        [FromServices] GetKpiQuery query,
        CancellationToken cancellationToken)
    {
        try
        {
            var dto = await query.ExecuteAsync(canonicalKpiId, cancellationToken);
            return dto is null ? TypedResults.NotFound() : TypedResults.Ok(dto);
        }
        catch (UnauthorizedAccessException ex)
        {
            return TypedResults.Problem(detail: ex.Message, statusCode: StatusCodes.Status403Forbidden);
        }
    }

    private static async Task<Results<Ok<IReadOnlyList<Insights.Application.Contracts.KpiHistoryPointDto>>, NotFound, ProblemHttpResult, BadRequest<ProblemDetails>>> GetHistory(
        string canonicalKpiId,
        DateOnly? from,
        DateOnly? to,
        [FromServices] GetKpiHistoryQuery query,
        CancellationToken cancellationToken)
    {
        var toInclusive = to ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var fromInclusive = from ?? toInclusive.AddDays(-30);

        try
        {
            var rows = await query.ExecuteAsync(canonicalKpiId, fromInclusive, toInclusive, cancellationToken);
            return rows is null ? TypedResults.NotFound() : TypedResults.Ok(rows);
        }
        catch (UnauthorizedAccessException ex)
        {
            return TypedResults.Problem(detail: ex.Message, statusCode: StatusCodes.Status403Forbidden);
        }
        catch (ArgumentException ex)
        {
            return TypedResults.BadRequest(new ProblemDetails { Title = "Invalid history range", Detail = ex.Message });
        }
    }
}
