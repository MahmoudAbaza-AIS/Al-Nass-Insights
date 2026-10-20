using Insights.Application.Abstractions;
using Insights.Infrastructure.Auth;
using Insights.Infrastructure.Options;
using Insights.Infrastructure.Persistence;
using Insights.Infrastructure.Sources.Api;
using Insights.Infrastructure.Sources.Oracle;
using Insights.Infrastructure.Sources.SqlServer;
using Insights.Infrastructure.Sync;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Insights.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInsightsInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<OracleSourceOptions>(configuration.GetSection(OracleSourceOptions.SectionName));
        services.Configure<SqlServerSymbolOptions>(configuration.GetSection(SqlServerSymbolOptions.SectionName));
        services.Configure<AppCacheOptions>(configuration.GetSection(AppCacheOptions.SectionName));
        services.Configure<SyncOptions>(configuration.GetSection(SyncOptions.SectionName));
        services.Configure<AuthenticationOptions>(configuration.GetSection(AuthenticationOptions.SectionName));

        services.AddSingleton<AppCacheMigrator>();
        services.AddSingleton<OwnedSqlMigrator>();
        services.AddScoped<IUserStore, SqlServerUserStore>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddHostedService<DemoUserSeeder>();

        var provider = configuration.GetSection(AppCacheOptions.SectionName).GetValue<string>("Provider") ?? "Redis";
        if (string.Equals(provider, "Redis", StringComparison.OrdinalIgnoreCase))
            services.AddSingleton<IAppCacheStore, RedisAppCacheStore>();
        else if (string.Equals(provider, "SqlServer", StringComparison.OrdinalIgnoreCase))
            services.AddSingleton<IAppCacheStore, SqlServerAppCacheStore>();
        else
            services.AddSingleton<IAppCacheStore, InMemoryAppCacheStore>();

        services.AddSingleton<IOracleKpiSource, OracleKpiSource>();
        services.AddSingleton<ISqlServerSymbolSource, SqlServerSymbolSource>();
        services.AddSingleton<ICustomerApiSource, DisabledCustomerApiSource>();
        services.AddHostedService<SynchronizationHostedService>();

        return services;
    }
}
