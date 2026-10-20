using System.Reflection;
using System.Text.RegularExpressions;
using DbUp;
using Insights.Infrastructure.Options;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Insights.Infrastructure.Persistence;

/// <summary>
/// Applies catalog + auth SQL scripts to the application-owned SQL Server
/// (Sources:SqlServerSymbols). Independent of AppCache provider (Redis vs SqlServer).
/// </summary>
public sealed class OwnedSqlMigrator(IOptions<SqlServerSymbolOptions> options, ILogger<OwnedSqlMigrator> logger)
{
    public void Migrate()
    {
        var cs = options.Value.ConnectionString;
        if (string.IsNullOrWhiteSpace(cs))
        {
            logger.LogWarning("Skipping owned SQL migrations: Sources:SqlServerSymbols:ConnectionString is empty.");
            return;
        }

        EnsureDatabaseExists(cs);

        var upgrade = DeployChanges.To
            .SqlDatabase(cs)
            .WithScriptsEmbeddedInAssembly(
                Assembly.GetExecutingAssembly(),
                s => s.Contains("Persistence.Migrations", StringComparison.Ordinal)
                     && !s.Contains("001_InitialAppCache", StringComparison.Ordinal))
            .LogToConsole()
            .Build();

        var result = upgrade.PerformUpgrade();
        if (!result.Successful)
            throw new InvalidOperationException("Owned SQL migration failed.", result.Error);

        logger.LogInformation("Owned SQL migrations (catalog + auth) applied successfully.");
    }

    private void EnsureDatabaseExists(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        var database = builder.InitialCatalog;
        if (string.IsNullOrWhiteSpace(database))
            throw new InvalidOperationException("Connection string must include Database=...");

        if (!Regex.IsMatch(database, @"^[A-Za-z0-9_\-]+$"))
            throw new InvalidOperationException($"Unsafe database name: {database}");

        builder.InitialCatalog = "master";
        using var conn = new SqlConnection(builder.ConnectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $"""
            IF DB_ID(N'{database}') IS NULL
                CREATE DATABASE [{database}];
            """;
        cmd.ExecuteNonQuery();
        logger.LogInformation("Ensured database {Database} exists.", database);
    }
}
