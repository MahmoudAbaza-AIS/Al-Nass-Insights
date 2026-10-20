namespace Insights.Application.Abstractions;

public sealed record AppUser(
    Guid UserId,
    string Username,
    string? Email,
    string PasswordHash,
    string DisplayName,
    string Organization,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> Dashboards,
    bool IsActive);

public interface IUserStore
{
    Task<AppUser?> FindByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task UpdateLastLoginAsync(Guid userId, DateTimeOffset atUtc, CancellationToken cancellationToken = default);
    Task EnsureDemoUserAsync(string passwordHash, CancellationToken cancellationToken = default);
}
