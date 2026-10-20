using Insights.Application.Dashboards;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Insights.Presentation.Endpoints;

public static class DashboardEndpoints
{
    public static RouteGroupBuilder MapDashboardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/dashboards")
            .WithTags("Dashboards")
            .RequireAuthorization();

        group.MapGet("/", GetDashboards)
            .WithName("GetDashboards")
            .WithSummary("List dashboard modules in the caller's data scope.");

        group.MapGet("/{dashboardId}", GetDashboard)
            .WithName("GetDashboard")
            .WithSummary("Get dashboard widgets from the published application cache only.");

        return group;
    }

    private static Ok<IReadOnlyList<Insights.Application.Contracts.DashboardSummaryDto>> GetDashboards(
        [FromServices] GetDashboardsQuery query) =>
        TypedResults.Ok(query.Execute());

    private static async Task<Results<Ok<Insights.Application.Contracts.DashboardDetailDto>, NotFound, ProblemHttpResult>> GetDashboard(
        string dashboardId,
        [FromServices] GetDashboardDetailQuery query,
        CancellationToken cancellationToken)
    {
        try
        {
            var detail = await query.ExecuteAsync(dashboardId, cancellationToken);
            return detail is null ? TypedResults.NotFound() : TypedResults.Ok(detail);
        }
        catch (UnauthorizedAccessException ex)
        {
            return TypedResults.Problem(detail: ex.Message, statusCode: StatusCodes.Status403Forbidden);
        }
    }
}
