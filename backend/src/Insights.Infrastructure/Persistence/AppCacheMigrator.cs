using System.Reflection;
using System.Text.RegularExpressions;
using DbUp;
using Insights.Infrastructure.Options;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Insights.Infrastructure.Persistence;

public sealed class AppCacheMigrator(IOptions<AppCacheOptions> options, ILogger<AppCacheMigrator> logger)
{
    public void Migrate()
    {
        var opts = options.Value;
        if (!string.Equals(opts.Provider, "SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogInformation("Skipping SQL migrations for provider {Provider}.", opts.Provider);
            return;
        }

        if (string.IsNullOrWhiteSpace(opts.ConnectionString))
            throw new InvalidOperationException("AppCache connection string is required for SqlServer migrations.");

        EnsureDatabaseExists(opts.ConnectionString);

        // Cache schema only — catalog/auth scripts run via OwnedSqlMigrator on Symbols SQL.
        var upgrade = DeployChanges.To
            .SqlDatabase(opts.ConnectionString)
            .WithScriptsEmbeddedInAssembly(
                Assembly.GetExecutingAssembly(),
                s => s.Contains("Persistence.Migrations", StringComparison.Ordinal)
                     && s.Contains("001_InitialAppCache", StringComparison.Ordinal))
            .LogToConsole()
            .Build();

        var result = upgrade.PerformUpgrade();
        if (!result.Successful)
            throw new InvalidOperationException("Application cache migration failed.", result.Error);

        logger.LogInformation("Application cache migrations applied successfully.");
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
