using System.Text.Json;
using System.Text.RegularExpressions;
using Dapper;
using Insights.Application.Abstractions;
using Insights.Infrastructure.Options;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Insights.Infrastructure.Sources.SqlServer;

/// <summary>
/// Read-only SQL Server access for hospital widgets/components/symbols metadata.
/// Executes only against an allowlisted view/table name.
/// </summary>
public sealed class SqlServerSymbolSource(
    IOptions<SqlServerSymbolOptions> options,
    ILogger<SqlServerSymbolSource> logger) : ISqlServerSymbolSource
{
    private static readonly Regex AllowlistedObject = new(
        @"^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)?$",
        RegexOptions.Compiled);

    public async Task<IReadOnlyList<SymbolMetadataRecord>> FetchSymbolsAsync(CancellationToken cancellationToken)
    {
        var opts = options.Value;
        if (!opts.Enabled || string.IsNullOrWhiteSpace(opts.ConnectionString))
        {
            logger.LogInformation("SQL Server symbols source disabled or not configured.");
            return [];
        }

        var symbolsObject = string.IsNullOrWhiteSpace(opts.SymbolsObject)
            ? "meta.v_SymbolCatalog"
            : opts.SymbolsObject;

        if (!AllowlistedObject.IsMatch(symbolsObject))
        {
            logger.LogWarning("SymbolsObject is not allowlisted; refusing query.");
            return [];
        }

        // Allowlisted catalog views expose SymbolId/Name/Category (+ optional kind/hint).
        var sql = $"""
            SELECT TOP (500)
                CAST(SymbolId AS nvarchar(80)) AS SymbolId,
                CAST(Name AS nvarchar(200)) AS Name,
                CAST(Category AS nvarchar(100)) AS Category,
                CAST(SymbolKind AS nvarchar(80)) AS SymbolKind,
                CAST(AssetHint AS nvarchar(200)) AS AssetHint,
                CAST(Description AS nvarchar(500)) AS Description
            FROM {symbolsObject}
            ORDER BY SymbolId
            """;

        await using var conn = new SqlConnection(opts.ConnectionString);
        try
        {
            var rows = (await conn.QueryAsync<SymbolRow>(new CommandDefinition(
                sql,
                commandTimeout: opts.CommandTimeoutSeconds,
                cancellationToken: cancellationToken))).ToList();

            // Also pull widgets when reading the symbol catalog so /metadata/symbols is complete.
            if (string.Equals(symbolsObject, "meta.v_SymbolCatalog", StringComparison.OrdinalIgnoreCase))
            {
                var widgets = await conn.QueryAsync<SymbolRow>(new CommandDefinition(
                    """
                    SELECT TOP (500)
                        CAST(SymbolId AS nvarchar(80)) AS SymbolId,
                        CAST(Name AS nvarchar(200)) AS Name,
                        CAST(Category AS nvarchar(100)) AS Category,
                        CAST(SymbolKind AS nvarchar(80)) AS SymbolKind,
                        CAST(AssetHint AS nvarchar(200)) AS AssetHint,
                        CAST(Description AS nvarchar(500)) AS Description
                    FROM meta.v_WidgetCatalog
                    ORDER BY SymbolId
                    """,
                    commandTimeout: opts.CommandTimeoutSeconds,
                    cancellationToken: cancellationToken));
                rows.AddRange(widgets);
            }

            var now = DateTimeOffset.UtcNow;
            return rows.Select(r => new SymbolMetadataRecord(
                r.SymbolId,
                r.Name,
                r.Category,
                JsonSerializer.Serialize(r),
                now,
                "hospital-catalog-v1")).ToList();
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(ex, "Failed reading symbols from {Object}.", symbolsObject);
            throw;
        }
    }

    private sealed class SymbolRow
    {
        public string SymbolId { get; init; } = "";
        public string Name { get; init; } = "";
        public string? Category { get; init; }
        public string? SymbolKind { get; init; }
        public string? AssetHint { get; init; }
        public string? Description { get; init; }
    }
}
