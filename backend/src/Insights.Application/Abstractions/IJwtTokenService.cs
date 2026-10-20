namespace Insights.Application.Abstractions;

public sealed record AuthTokenResult(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    string TokenType,
    AppUser User);

public interface IJwtTokenService
{
    AuthTokenResult CreateToken(AppUser user);
}
