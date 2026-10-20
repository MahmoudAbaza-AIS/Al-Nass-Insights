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
var authDisabled = builder.Configuration.GetValue("Authentication:DisableForLocalDevelopment", false)
    && allowAuthBypass;

if (authDisabled)
{
    builder.Services.AddAuthentication("Development")
        .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, DevelopmentAuthHandler>(
            "Development", _ => { });
}
else
{
    var authority = builder.Configuration["Authentication:Authority"]
        ?? throw new InvalidOperationException("Authentication:Authority (Keycloak realm URL) is required outside local-dev bypass.");
    var audience = builder.Configuration["Authentication:Audience"]
        ?? throw new InvalidOperationException("Authentication:Audience is required.");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = authority;
            options.Audience = audience;
            options.RequireHttpsMetadata = builder.Configuration.GetValue("Authentication:RequireHttpsMetadata", true);
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
                Description = "Keycloak access token"
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

var app = builder.Build();

var cacheOpts = app.Configuration.GetSection(AppCacheOptions.SectionName).Get<AppCacheOptions>();
if (cacheOpts is { Provider: "SqlServer" } && app.Configuration.GetValue("AppCache:RunMigrationsOnStartup", false))
{
    // Optional local/Docker convenience — production prefers deploy scripts + separate credentials.
    app.Services.GetRequiredService<AppCacheMigrator>().Migrate();
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
