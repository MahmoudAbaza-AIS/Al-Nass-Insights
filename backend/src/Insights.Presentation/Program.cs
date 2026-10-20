using System.Text;
using System.Text.Json.Serialization;
using Insights.Application;
using Insights.Application.Security;
using Insights.Infrastructure;
using Insights.Infrastructure.Options;
using Insights.Infrastructure.Persistence;
using Insights.Presentation.Endpoints;
using Insights.Presentation.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

builder.Services.AddHybridCache();

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
        options.WithOpenApiRoutePattern("/openapi/{documentName}.json");
    }).AllowAnonymous();
}

app.Run();

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
