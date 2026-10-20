using Insights.Application.Abstractions;

namespace Insights.Infrastructure.Sources.Api;

/// <summary>
/// Customer APIs are not configured. Does not invent replacement endpoints.
/// </summary>
public sealed class DisabledCustomerApiSource : ICustomerApiSource
{
    public Task<bool> IsConfiguredAsync(CancellationToken cancellationToken) => Task.FromResult(false);
}
