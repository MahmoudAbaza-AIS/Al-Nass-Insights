namespace Insights.Application.Abstractions;

/// <summary>
/// Read-only customer SQL Server access for widgets/components/symbols metadata.
/// </summary>
public interface ISqlServerSymbolSource
{
    Task<IReadOnlyList<SymbolMetadataRecord>> FetchSymbolsAsync(CancellationToken cancellationToken);
}
