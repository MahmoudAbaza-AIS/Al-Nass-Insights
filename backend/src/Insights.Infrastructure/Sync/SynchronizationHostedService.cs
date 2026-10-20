using Insights.Application.Sync;
using Insights.Domain.Kpis;
using Insights.Infrastructure.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Insights.Infrastructure.Sync;

public sealed class SynchronizationHostedService(
    IServiceScopeFactory scopeFactory,
    IOptions<SyncOptions> options,
    ILogger<SynchronizationHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var opts = options.Value;
        if (!opts.Enabled)
        {
            logger.LogInformation("Synchronization hosted service disabled by configuration.");
            return;
        }

        // Initial delay so the host can finish startup/health registration.
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var orchestrator = scope.ServiceProvider.GetRequiredService<SynchronizationOrchestrator>();
                var outcome = await orchestrator.RunAsync(RefreshTier.Tier3Operational, stoppingToken);
                logger.LogInformation("Tier3 sync completed with outcome {Outcome}.", outcome);

                if (opts.ActivateFasterTiers)
                {
                    // Faster tiers are code-ready but off by default until hospital/DBA approval.
                    await orchestrator.RunAsync(RefreshTier.Tier2Intraday, stoppingToken);
                    await orchestrator.RunAsync(RefreshTier.Tier1LiveStatus, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Synchronization cycle failed.");
            }

            var delay = TimeSpan.FromMinutes(Math.Max(1, opts.Tier3IntervalMinutes));
            await Task.Delay(delay, stoppingToken);
        }
    }
}
