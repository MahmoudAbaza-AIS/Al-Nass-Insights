namespace Insights.Infrastructure.Options;

public sealed class AuthenticationOptions
{
    public const string SectionName = "Authentication";

    /// <summary>LocalJwt (default) | Keycloak</summary>
    public string Mode { get; set; } = "LocalJwt";

    public string Issuer { get; set; } = "alnass-insights";
    public string Audience { get; set; } = "alnass-insights-api";
    public string SigningKey { get; set; } = string.Empty;
    public int TokenLifetimeMinutes { get; set; } = 480;

    /// <summary>Keycloak realm URL when Mode=Keycloak.</summary>
    public string Authority { get; set; } = string.Empty;
    public bool RequireHttpsMetadata { get; set; } = true;
    public bool DisableForLocalDevelopment { get; set; }
}
