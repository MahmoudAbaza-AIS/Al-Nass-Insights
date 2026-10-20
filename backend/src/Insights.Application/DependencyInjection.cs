using Insights.Application.Abstractions;
using Insights.Application.Auth;
using Insights.Application.Dashboards;
using Insights.Application.Kpis;
using Insights.Application.Sync;
using Microsoft.Extensions.DependencyInjection;

namespace Insights.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddInsightsApplication(this IServiceCollection services)
    {
        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<GetDashboardsQuery>();
        services.AddScoped<GetDashboardDetailQuery>();
        services.AddScoped<GetKpiQuery>();
        services.AddScoped<GetKpiHistoryQuery>();
        services.AddScoped<LoginCommand>();
        services.AddScoped<SynchronizationOrchestrator>();
        return services;
    }
}
