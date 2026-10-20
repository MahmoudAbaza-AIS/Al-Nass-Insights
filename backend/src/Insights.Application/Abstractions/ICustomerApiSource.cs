namespace Insights.Application.Abstractions;

/// <summary>
/// Placeholder for approved customer APIs. Implementations must not invent endpoints.
/// </summary>
public interface ICustomerApiSource
{
    Task<bool> IsConfiguredAsync(CancellationToken cancellationToken);
}
