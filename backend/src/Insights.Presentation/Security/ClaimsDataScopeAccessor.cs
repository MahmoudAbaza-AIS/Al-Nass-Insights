using System.Security.Claims;
using Insights.Application.Security;

namespace Insights.Presentation.Security;

public sealed class ClaimsDataScopeAccessor(IHttpContextAccessor httpContextAccessor) : IDataScopeAccessor
{
    public const string OrganizationClaim = "organization";
    public const string OrgClaimAlt = "org";
    public const string DashboardClaim = "dashboard";
    public const string DashboardsClaim = "dashboards";

    public DataScope GetRequiredScope()
    {
        var user = httpContextAccessor.HttpContext?.User
            ?? throw new UnauthorizedAccessException("No authenticated user.");

        if (user.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException("Authentication required.");

        var org = user.FindFirstValue(OrganizationClaim)
            ?? user.FindFirstValue(OrgClaimAlt)
            ?? user.FindFirstValue("tenant")
            ?? throw new UnauthorizedAccessException("Organization claim is required.");

        var roles = user.FindAll(ClaimTypes.Role)
            .Concat(user.FindAll("roles"))
            .Select(c => c.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var dashboards = user.FindAll(DashboardClaim)
            .Concat(user.FindAll(DashboardsClaim))
            .SelectMany(c => c.Value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Privileged roles may receive wildcard access when dashboards were not mapped.
        if (dashboards.Count == 0 && (roles.Contains("executive") || roles.Contains("admin") || roles.Contains("Insights.Admin")))
            dashboards.Add("*");

        // Empty dashboard set means no dashboard access — do not expand to all DASH-01..07.
        return new DataScope(org, dashboards, roles);
    }
}
