using Insights.Application.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Insights.Infrastructure.Auth;

/// <summary>Ensures the demo test user exists after owned SQL migrations.</summary>
public sealed class DemoUserSeeder(IServiceProvider services, ILogger<DemoUserSeeder> logger) : IHostedService
{
    public const string DemoUsername = "demo";
    public const string DemoPassword = "Demo123!";

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = services.CreateScope();
            var users = scope.ServiceProvider.GetRequiredService<IUserStore>();
            var hasher = new PasswordHasher<AppUser>();
            var hash = hasher.HashPassword(
                new AppUser(
                    Guid.Empty,
                    DemoUsername,
                    "demo@alnass.local",
                    string.Empty,
                    "Demo User",
                    "Al Nass Hospital",
                    ["executive"],
                    ["*"],
                    true),
                DemoPassword);
            await users.EnsureDemoUserAsync(hash, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not seed demo user (SQL may be unavailable yet).");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
