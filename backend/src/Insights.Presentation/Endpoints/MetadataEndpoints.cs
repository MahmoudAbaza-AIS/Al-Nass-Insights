using Insights.Application.Abstractions;
using Insights.Application.Contracts;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Insights.Presentation.Endpoints;

public static class MetadataEndpoints
{
    public static RouteGroupBuilder MapMetadataEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/metadata")
            .WithTags("Metadata")
            .RequireAuthorization();

        group.MapGet("/symbols", GetSymbols)
            .WithName("GetSymbols")
            .WithSummary("Published symbol/widget metadata snapshot from the application cache.");

        return group;
    }

    private static async Task<Ok<IReadOnlyList<SymbolDto>>> GetSymbols(
        [FromServices] IAppCacheStore cache,
        CancellationToken cancellationToken)
    {
        var rows = await cache.GetSymbolMetadataAsync(cancellationToken);
        var dtos = rows.Select(r => new SymbolDto(r.SymbolId, r.Name, r.Category, r.CapturedAt, r.SourceVersion)).ToList();
        return TypedResults.Ok<IReadOnlyList<SymbolDto>>(dtos);
    }
}
