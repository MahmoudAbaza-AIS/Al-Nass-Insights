using Insights.Application.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Insights.Application.Auth;

public sealed class LoginCommand(
    IUserStore users,
    IJwtTokenService tokens,
    IClock clock,
    ILogger<LoginCommand> logger)
{
    private readonly PasswordHasher<AppUser> _passwordHasher = new();

    public async Task<LoginResult> ExecuteAsync(string username, string password, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return LoginResult.Failed("Username and password are required.");

        var user = await users.FindByUsernameAsync(username.Trim(), cancellationToken);
        if (user is null || !user.IsActive)
        {
            logger.LogWarning("Login failed for unknown or inactive user {Username}.", username);
            return LoginResult.Failed("Invalid username or password.");
        }

        var verify = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (verify == PasswordVerificationResult.Failed)
        {
            logger.LogWarning("Login failed for user {Username}: bad password.", username);
            return LoginResult.Failed("Invalid username or password.");
        }

        var issued = tokens.CreateToken(user);
        await users.UpdateLastLoginAsync(user.UserId, clock.UtcNow, cancellationToken);
        return LoginResult.Succeeded(issued);
    }
}

public sealed record LoginResult(bool Success, string? Error, AuthTokenResult? Token)
{
    public static LoginResult Failed(string error) => new(false, error, null);
    public static LoginResult Succeeded(AuthTokenResult token) => new(true, null, token);
}
