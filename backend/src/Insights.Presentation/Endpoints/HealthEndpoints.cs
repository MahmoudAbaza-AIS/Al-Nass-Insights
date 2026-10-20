using Insights.Application.Abstractions;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Insights.Presentation.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/health/live", () => TypedResults.Ok(new { status = "live" }))
            .WithTags("Health")
            .AllowAnonymous()
            .WithSummary("Liveness probe (no dependency checks).");

        app.MapGet("/health/ready", Ready)
            .WithTags("Health")
            .AllowAnonymous()
            .WithSummary("Readiness probe against the application cache only (never customer sources).");

        return app;
    }

    private static async Task<Results<Ok<object>, StatusCodeHttpResult>> Ready(
        IAppCacheStore cache,
        CancellationToken cancellationToken)
    {
        try
        {
            // Touch cache without probing Oracle/SQL Server sources.
            _ = await cache.GetSymbolMetadataAsync(cancellationToken);
            return TypedResults.Ok<object>(new { status = "ready", cache = "ok" });
        }
        catch
        {
            return TypedResults.StatusCode(StatusCodes.Status503ServiceUnavailable);
        }
    }
}
