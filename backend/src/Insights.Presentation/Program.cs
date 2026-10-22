using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Insights.Application;
using Insights.Application.Security;
using Insights.Infrastructure;
using Insights.Infrastructure.Options;
using Insights.Infrastructure.Persistence;
using Insights.Presentation.Endpoints;
using Insights.Presentation.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using AuthOpts = Insights.Infrastructure.Options.AuthenticationOptions;

var builder = WebApplication.CreateBuilder(args);

if (OperatingSystem.IsWindows())
{
    // Enables running Presentation as a Windows Service (API + hosted sync) without interactive login.
    builder.Host.UseWindowsService();
}

builder.Services.AddInsightsApplication();
builder.Services.AddInsightsInfrastructure(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IDataScopeAccessor, ClaimsDataScopeAccessor>();

builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Auth bypass is allowed only in Development and PPR — never in Production.
var allowAuthBypass =
    builder.Environment.IsDevelopment()
    || string.Equals(builder.Environment.EnvironmentName, "ppr", StringComparison.OrdinalIgnoreCase);
var authOpts = builder.Configuration.GetSection(AuthOpts.SectionName).Get<AuthOpts>() ?? new AuthOpts();
var authDisabled = authOpts.DisableForLocalDevelopment && allowAuthBypass;
var authMode = string.IsNullOrWhiteSpace(authOpts.Mode) ? "LocalJwt" : authOpts.Mode;

if (authDisabled)
{
    builder.Services.AddAuthentication("Development")
        .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, DevelopmentAuthHandler>(
            "Development", _ => { });
}
else if (string.Equals(authMode, "Keycloak", StringComparison.OrdinalIgnoreCase))
{
    var authority = authOpts.Authority
        ?? throw new InvalidOperationException("Authentication:Authority (Keycloak realm URL) is required when Mode=Keycloak.");
    var audience = authOpts.Audience
        ?? throw new InvalidOperationException("Authentication:Audience is required.");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = authority;
            options.Audience = audience;
            options.RequireHttpsMetadata = authOpts.RequireHttpsMetadata;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ClockSkew = TimeSpan.FromMinutes(1),
                ValidAudience = audience,
                NameClaimType = "preferred_username",
                RoleClaimType = "roles"
            };
        });
}
else
{
    // LocalJwt — tokens issued by POST /api/v1/auth/login against auth.Users.
    if (string.IsNullOrWhiteSpace(authOpts.SigningKey) || authOpts.SigningKey.Length < 32)
        throw new InvalidOperationException("Authentication:SigningKey must be at least 32 characters for LocalJwt.");

    if (IsPlaceholderSigningKey(authOpts.SigningKey) && !builder.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "Authentication:SigningKey is still a placeholder. Set a unique secret via environment configuration before running outside Development.");
    }

    if (authOpts.SeedDemoUser && builder.Environment.IsProduction())
    {
        throw new InvalidOperationException(
            "Authentication:SeedDemoUser must be false in Production.");
    }

    var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authOpts.SigningKey));
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = authOpts.RequireHttpsMetadata;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = authOpts.Issuer,
                ValidAudience = authOpts.Audience,
                IssuerSigningKey = signingKey,
                ClockSkew = TimeSpan.FromMinutes(1),
                NameClaimType = "preferred_username",
                RoleClaimType = System.Security.Claims.ClaimTypes.Role
            };
        });
}

builder.Services.AddAuthorization();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth-login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

// Browser origins for cross-origin calls (Vite / separate UI host). Empty = same-origin only.
var corsOrigins = ParseCorsOrigins(builder.Configuration);
const string corsPolicyName = "Frontend";
if (corsOrigins.Length > 0)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(corsPolicyName, policy =>
            policy.WithOrigins(corsOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod());
    });
}

var enableOpenApi = builder.Configuration.GetValue("OpenApi:Enabled", builder.Environment.IsDevelopment());
if (enableOpenApi)
{
    builder.Services.AddOpenApi("v1", options =>
    {
        options.AddDocumentTransformer((document, _, _) =>
        {
            document.Info = new OpenApiInfo
            {
                Title = "Al-Nass Insights API",
                Version = "v1",
                Description = "Cache-first hospital dashboard read APIs. Dashboard traffic never queries customer sources."
            };
            document.Components ??= new OpenApiComponents();
            document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
            document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "JWT from POST /api/v1/auth/login (or Keycloak when Mode=Keycloak)"
            };
            return Task.CompletedTask;
        });
    });
}

// One-shot owned-cache + catalog migration (deploy / local). Never targets customer Oracle.
if (args.Contains("--migrate-app-cache", StringComparer.OrdinalIgnoreCase))
{
    var migrateApp = builder.Build();
    migrateApp.Services.GetRequiredService<AppCacheMigrator>().Migrate();
    return;
}

if (args.Contains("--migrate-owned-sql", StringComparer.OrdinalIgnoreCase))
{
    var migrateOwned = builder.Build();
    migrateOwned.Services.GetRequiredService<OwnedSqlMigrator>().Migrate();
    return;
}

var app = builder.Build();

EnsureOracleBackedDataPath(app);

var cacheOpts = app.Configuration.GetSection(AppCacheOptions.SectionName).Get<AppCacheOptions>();
if (cacheOpts is { Provider: "SqlServer" } && app.Configuration.GetValue("AppCache:RunMigrationsOnStartup", false))
{
    // Optional local/Docker convenience — production prefers deploy scripts + separate credentials.
    app.Services.GetRequiredService<AppCacheMigrator>().Migrate();
}

// Catalog + auth.Users on application-owned SQL Server (works with Redis app-cache).
if (app.Configuration.GetValue("Sources:SqlServerSymbols:RunMigrationsOnStartup", true)
    && !string.IsNullOrWhiteSpace(app.Configuration["Sources:SqlServerSymbols:ConnectionString"]))
{
    app.Services.GetRequiredService<OwnedSqlMigrator>().Migrate();
}

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerPathFeature>();
        var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("ExceptionHandler");
        if (feature?.Error is not null)
        {
            logger.LogError(
                feature.Error,
                "Unhandled exception for {Method} {Path} (TraceId={TraceId})",
                context.Request.Method,
                context.Request.Path.Value,
                context.TraceIdentifier);
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(new
        {
            type = "https://httpstatuses.com/500",
            title = "An unexpected error occurred.",
            status = 500,
            traceId = context.TraceIdentifier
        });
    });
});

if (corsOrigins.Length > 0)
    app.UseCors(corsPolicyName);

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthEndpoints();
app.MapAuthEndpoints();
app.MapDashboardEndpoints();
app.MapKpiEndpoints();
app.MapMetadataEndpoints();

if (enableOpenApi)
{
    app.MapOpenApi().AllowAnonymous();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Al-Nass Insights");
        options.WithTheme(ScalarTheme.Mars);
        options.WithOpenApiRoutePattern("/openapi/{documentName}.json");
    }).AllowAnonymous();
}

app.Run();

static bool IsPlaceholderSigningKey(string signingKey) =>
    signingKey.Contains("CHANGE_ME_TO_A_LONG_RANDOM_SECRET", StringComparison.OrdinalIgnoreCase);

/// <summary>
/// KPI numbers must originate from hospital Oracle via sync → app cache.
/// Ban InMemory cache and disabled/placeholder Oracle outside Development.
/// </summary>
static void EnsureOracleBackedDataPath(WebApplication app)
{
    var cacheProvider = app.Configuration["AppCache:Provider"] ?? "Redis";
    if (string.Equals(cacheProvider, "InMemory", StringComparison.OrdinalIgnoreCase)
        && !app.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "AppCache:Provider=InMemory is not allowed outside Development. Use Redis or SqlServer so Oracle-synced KPI values persist.");
    }

    var requireOracle =
        app.Environment.IsProduction()
        || string.Equals(app.Environment.EnvironmentName, "ppr", StringComparison.OrdinalIgnoreCase);

    if (!requireOracle)
        return;

    var oracleEnabled = app.Configuration.GetValue("Sources:Oracle:Enabled", false);
    var oracleCs = app.Configuration["Sources:Oracle:ConnectionString"] ?? string.Empty;
    var syncEnabled = app.Configuration.GetValue("Synchronization:Enabled", true);

    if (!syncEnabled)
    {
        throw new InvalidOperationException(
            "Synchronization must be enabled so dashboards receive Oracle KPI values through the app cache.");
    }

    if (!oracleEnabled
        || string.IsNullOrWhiteSpace(oracleCs)
        || oracleCs.Contains("CHANGE_ME", StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException(
            "Sources:Oracle must be enabled with a real connection string. Dashboard KPI values are not mocked; they are published from Oracle into the app cache.");
    }
}

static string[] ParseCorsOrigins(IConfiguration configuration)
{
    var configured = configuration["Cors:AllowedOrigins"] ?? string.Empty;
    var dashboard = configuration["PublicUrls:Dashboard"] ?? string.Empty;
    var combined = $"{configured};{dashboard}";
    return combined
        .Split([';', ','], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Where(o => Uri.TryCreate(o, UriKind.Absolute, out var uri)
                    && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();
}

public partial class Program;

internal sealed class DevelopmentAuthHandler(
    Microsoft.Extensions.Options.IOptionsMonitor<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions> options,
    Microsoft.Extensions.Logging.ILoggerFactory logger,
    System.Text.Encodings.Web.UrlEncoder encoder)
    : Microsoft.AspNetCore.Authentication.AuthenticationHandler<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<Microsoft.AspNetCore.Authentication.AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "local-dev"),
            new System.Security.Claims.Claim(ClaimsDataScopeAccessor.OrganizationClaim, "Al Nass Hospital"),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, "executive"),
            new System.Security.Claims.Claim(ClaimsDataScopeAccessor.DashboardsClaim, "*")
        };
        var identity = new System.Security.Claims.ClaimsIdentity(claims, "Development");
        var principal = new System.Security.Claims.ClaimsPrincipal(identity);
        var ticket = new Microsoft.AspNetCore.Authentication.AuthenticationTicket(principal, "Development");
        return Task.FromResult(Microsoft.AspNetCore.Authentication.AuthenticateResult.Success(ticket));
    }
}
