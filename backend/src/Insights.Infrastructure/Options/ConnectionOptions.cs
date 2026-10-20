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
}

public sealed class AppCacheOptions
{
    public const string SectionName = "AppCache";
    /// <summary>Redis: host:port (e.g. redis:6379). SqlServer: ADO.NET connection string.</summary>
    public string ConnectionString { get; set; } = string.Empty;
    /// <summary>Redis | SqlServer | InMemory</summary>
    public string Provider { get; set; } = "Redis";
    public int CommandTimeoutSeconds { get; set; } = 30;
    /// <summary>Redis key namespace prefix (default alnass).</summary>
    public string KeyPrefix { get; set; } = "alnass";
}

public sealed class SyncOptions
{
    public const string SectionName = "Synchronization";
    public bool Enabled { get; set; } = true;
    /// <summary>Default documented interval: 6 hours (Tier3).</summary>
    public int Tier3IntervalMinutes { get; set; } = 360;
    public bool ActivateFasterTiers { get; set; }
}
