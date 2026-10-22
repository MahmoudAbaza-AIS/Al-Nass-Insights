using Dapper;
using Insights.Application.Abstractions;
using Insights.Infrastructure.Options;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Insights.Infrastructure.Auth;

public sealed class SqlServerUserStore(
    IOptions<SqlServerSymbolOptions> options,
    ILogger<SqlServerUserStore> logger) : IUserStore
{
    public async Task<AppUser?> FindByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        await using var conn = await OpenConnectionAsync(cancellationToken);
        const string sql = """
            SELECT
                user_id AS UserId,
                username AS Username,
                email AS Email,
                password_hash AS PasswordHash,
                display_name AS DisplayName,
                organization AS Organization,
                roles AS RolesCsv,
                dashboards AS DashboardsCsv,
                is_active AS IsActive
            FROM auth.Users
            WHERE username = @Username;
            """;

        var row = await conn.QuerySingleOrDefaultAsync<UserRow>(
            new CommandDefinition(sql, new { Username = username }, cancellationToken: cancellationToken));

        return row is null ? null : row.ToAppUser();
    }

    public async Task UpdateLastLoginAsync(Guid userId, DateTimeOffset atUtc, CancellationToken cancellationToken = default)
    {
        await using var conn = await OpenConnectionAsync(cancellationToken);
        const string sql = """
            UPDATE auth.Users
            SET last_login_at_utc = @AtUtc
            WHERE user_id = @UserId;
            """;
        await conn.ExecuteAsync(new CommandDefinition(
            sql,
            new { UserId = userId, AtUtc = atUtc.UtcDateTime },
            cancellationToken: cancellationToken));
    }

    public async Task EnsureDemoUserAsync(string passwordHash, CancellationToken cancellationToken = default)
    {
        await using var conn = await OpenConnectionAsync(cancellationToken);
        const string sql = """
            IF NOT EXISTS (SELECT 1 FROM auth.Users WHERE username = N'demo')
            BEGIN
                INSERT INTO auth.Users
                (
                    username, email, password_hash, display_name, organization,
                    roles, dashboards, is_active, created_at_utc
                )
                VALUES
                (
                    N'demo', N'demo@alnass.local', @PasswordHash, N'Demo User', N'Al Nass Hospital',
                    N'executive', N'*', 1, SYSUTCDATETIME()
                );
            END;
            """;

        var inserted = await conn.ExecuteAsync(new CommandDefinition(
            sql,
            new { PasswordHash = passwordHash },
            cancellationToken: cancellationToken));

        if (inserted > 0)
            logger.LogInformation("Seeded demo user (username: demo).");
    }

    private async Task<SqlConnection> OpenConnectionAsync(CancellationToken cancellationToken)
    {
        var cs = options.Value.ConnectionString;
        if (string.IsNullOrWhiteSpace(cs))
            throw new InvalidOperationException("Sources:SqlServerSymbols:ConnectionString is required for local JWT auth.");

        var conn = new SqlConnection(cs);
        await conn.OpenAsync(cancellationToken);
        return conn;
    }

    private sealed class UserRow
    {
        public Guid UserId { get; init; }
        public string Username { get; init; } = string.Empty;
        public string? Email { get; init; }
        public string PasswordHash { get; init; } = string.Empty;
        public string DisplayName { get; init; } = string.Empty;
        public string Organization { get; init; } = string.Empty;
        public string RolesCsv { get; init; } = string.Empty;
        public string DashboardsCsv { get; init; } = "*";
        public bool IsActive { get; init; }

        public AppUser ToAppUser() => new(
            UserId,
            Username,
            Email,
            PasswordHash,
            DisplayName,
            Organization,
            SplitCsv(RolesCsv),
            SplitCsv(DashboardsCsv),
            IsActive);

        private static IReadOnlyList<string> SplitCsv(string value) =>
            value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}
