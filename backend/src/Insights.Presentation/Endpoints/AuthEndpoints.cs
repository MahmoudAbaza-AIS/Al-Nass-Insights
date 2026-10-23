using Insights.Application.Auth;
using Insights.Infrastructure.Auth;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Insights.Presentation.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth")
            .WithTags("Auth");

        // AllowAnonymous only on login — do not put it on the group (would skip /me auth).
        group.MapPost("/login", Login)
            .WithName("Login")
            .WithSummary("Authenticate with username/password and receive a JWT access token.")
            .AllowAnonymous()
            .RequireRateLimiting("auth-login");

        group.MapGet("/me", Me)
            .WithName("GetCurrentUser")
            .WithSummary("Return the authenticated user claims.")
            .RequireAuthorization();

        return group;
    }

    private static async Task<Results<Ok<LoginResponse>, UnauthorizedHttpResult, ValidationProblem>> Login(
        [FromBody] LoginRequest request,
        [FromServices] LoginCommand login,
        CancellationToken cancellationToken)
    {
        if (request is null)
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["body"] = ["Request body is required."]
            });

        var username = request.Username?.Trim() ?? string.Empty;
        var password = request.Password ?? string.Empty;

        if (username.Length is 0 or > 128 || password.Length is 0 or > 256)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["credentials"] = ["Username and password are required (username ≤ 128, password ≤ 256)."]
            });
        }

        var result = await login.ExecuteAsync(username, password, cancellationToken);
        if (!result.Success || result.Token is null)
            return TypedResults.Unauthorized();

        var token = result.Token;
        return TypedResults.Ok(new LoginResponse(
            token.AccessToken,
            token.TokenType,
            token.ExpiresAt,
            new AuthUserDto(
                token.User.UserId,
                token.User.Username,
                token.User.DisplayName,
                token.User.Email,
                token.User.Organization,
                token.User.Roles,
                token.User.Dashboards)));
    }

    private static Results<Ok<AuthUserDto>, UnauthorizedHttpResult> Me(HttpContext http)
    {
        var user = http.User;
        if (user.Identity?.IsAuthenticated != true)
            return TypedResults.Unauthorized();

        var username = user.FindFirst("preferred_username")?.Value
            ?? user.Identity.Name
            ?? "unknown";
        // JWT bearer maps NameClaimType to preferred_username, so ClaimTypes.Name may appear
        // more than once (username + display name). Prefer a Name claim that is not the username.
        var displayName = user.FindAll(System.Security.Claims.ClaimTypes.Name)
                .Select(c => c.Value)
                .FirstOrDefault(v => !string.Equals(v, username, StringComparison.OrdinalIgnoreCase))
            ?? user.FindFirst("name")?.Value
            ?? username;
        var org = user.FindFirst(JwtTokenService.OrganizationClaim)?.Value ?? string.Empty;
        var email = user.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value;
        // LocalJwt uses ClaimTypes.Role; Keycloak is configured with RoleClaimType = "roles".
        var roles = user.FindAll(System.Security.Claims.ClaimTypes.Role)
            .Concat(user.FindAll("roles"))
            .Select(c => c.Value)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var dashboards = user.FindAll(JwtTokenService.DashboardsClaim)
            .Concat(user.FindAll("dashboard"))
            .SelectMany(c => c.Value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        Guid.TryParse(user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst("sub")?.Value, out var userId);

        return TypedResults.Ok(new AuthUserDto(userId, username, displayName, email, org, roles, dashboards));
    }

    public sealed record LoginRequest(string? Username, string? Password);

    public sealed record LoginResponse(
        string AccessToken,
        string TokenType,
        DateTimeOffset ExpiresAt,
        AuthUserDto User);

    public sealed record AuthUserDto(
        Guid UserId,
        string Username,
        string DisplayName,
        string? Email,
        string Organization,
        IReadOnlyList<string> Roles,
        IReadOnlyList<string> Dashboards);
}
