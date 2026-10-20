using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Insights.Application.Abstractions;
using Insights.Infrastructure.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Insights.Infrastructure.Auth;

public sealed class JwtTokenService(IOptions<AuthenticationOptions> options, IClock clock) : IJwtTokenService
{
    public const string OrganizationClaim = "organization";
    public const string DashboardsClaim = "dashboards";

    public AuthTokenResult CreateToken(AppUser user)
    {
        var opts = options.Value;
        if (string.IsNullOrWhiteSpace(opts.SigningKey) || opts.SigningKey.Length < 32)
            throw new InvalidOperationException("Authentication:SigningKey must be at least 32 characters for LocalJwt.");

        var now = clock.UtcNow;
        var expires = now.AddMinutes(Math.Clamp(opts.TokenLifetimeMinutes, 5, 24 * 60));
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new("preferred_username", user.Username),
            new(ClaimTypes.Name, user.DisplayName),
            new(OrganizationClaim, user.Organization),
            new(DashboardsClaim, string.Join(',', user.Dashboards))
        };

        foreach (var role in user.Roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        if (!string.IsNullOrWhiteSpace(user.Email))
            claims.Add(new Claim(JwtRegisteredClaimNames.Email, user.Email));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.SigningKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: opts.Issuer,
            audience: opts.Audience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expires.UtcDateTime,
            signingCredentials: creds);

        var encoded = new JwtSecurityTokenHandler().WriteToken(token);
        return new AuthTokenResult(encoded, expires, "Bearer", user);
    }
}
