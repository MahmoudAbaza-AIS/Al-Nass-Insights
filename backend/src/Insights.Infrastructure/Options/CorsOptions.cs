namespace Insights.Infrastructure.Options;

public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    /// <summary>
    /// Comma or semicolon separated browser origins allowed to call the API cross-origin
    /// (e.g. Vite http://localhost:5173). Same-origin nginx/Docker UI does not need this.
    /// </summary>
    public string AllowedOrigins { get; set; } = string.Empty;
}
