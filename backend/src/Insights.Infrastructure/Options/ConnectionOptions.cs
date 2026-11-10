namespace Insights.Infrastructure.Options;

public sealed class OracleSourceOptions
{
    public const string SectionName = "Sources:Oracle";
    public string ConnectionString { get; set; } = string.Empty;
    public int CommandTimeoutSeconds { get; set; } = 60;
    public bool Enabled { get; set; }
}

public sealed class SqlServerSymbolOptions
{
    public const string SectionName = "Sources:SqlServerSymbols";
    public string ConnectionString { get; set; } = string.Empty;
    public int CommandTimeoutSeconds { get; set; } = 30;
    public bool Enabled { get; set; }
    /// <summary>Allowlisted schema.table for symbol metadata — never arbitrary SQL from metadata.</summary>
    public string SymbolsObject { get; set; } = string.Empty;
    /// <summary>Apply catalog + auth DbUp scripts on startup (default true when connection string is set).</summary>
    public bool RunMigrationsOnStartup { get; set; } = true;
}

public sealed class AppCacheOptions
{
    public const string SectionName = "AppCache";

    /// <summary>
    /// StackExchange.Redis configuration string.
    /// Docker (same Compose network): <c>redis:6379</c>.
    /// Local backend against published Redis: <c>localhost:6379</c> (or host port from REDIS_HOST_PORT).
    /// Overridden at runtime by env <c>AppCache__ConnectionString</c> / <c>APPCACHE_CONNECTION_STRING</c>.
    /// </summary>
    public string ConnectionString { get; set; } = string.Empty;

    /// <summary>Redis | SqlServer | InMemory. InMemory skips Redis entirely.</summary>
    public string Provider { get; set; } = "Redis";

    public int CommandTimeoutSeconds { get; set; } = 30;

    /// <summary>Redis key namespace prefix (per-stack, e.g. alnass-dev).</summary>
    public string KeyPrefix { get; set; } = "alnass";

    /// <summary>Only used when Provider=SqlServer. Redis ignores SQL cache migrations.</summary>
    public bool RunMigrationsOnStartup { get; set; }
}

public sealed class SyncOptions
{
    public const string SectionName = "Synchronization";
    public bool Enabled { get; set; } = true;
    /// <summary>Default documented interval: 6 hours (Tier3).</summary>
    public int Tier3IntervalMinutes { get; set; } = 360;
    public bool ActivateFasterTiers { get; set; }
}
