using Insights.Application.Abstractions;
using Insights.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NSubstitute;

namespace Insights.IntegrationTests;

public class DashboardNeverHitsSourceTests
{
    [Fact]
    public async Task Reading_Dashboard_Does_Not_Call_Oracle_Adapter()
    {
        var oracle = Substitute.For<IOracleKpiSource>();
        await using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("Authentication:DisableForLocalDevelopment", "true");
            builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Development");
            builder.UseSetting("Synchronization:Enabled", "false");
            builder.UseSetting("Sources:SqlServerSymbols:RunMigrationsOnStartup", "false");
            builder.UseSetting("Sources:SqlServerSymbols:ConnectionString", "");
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IOracleKpiSource>();
                services.AddSingleton(oracle);
                services.RemoveAll<IAppCacheStore>();
                services.AddSingleton<IAppCacheStore, InMemoryAppCacheStore>();
            });
        });

        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/v1/dashboards/DASH-05");
        response.EnsureSuccessStatusCode();

        await oracle.DidNotReceive().FetchApprovedQueriesAsync(Arg.Any<IReadOnlyList<string>>(), Arg.Any<CancellationToken>());
    }
}
