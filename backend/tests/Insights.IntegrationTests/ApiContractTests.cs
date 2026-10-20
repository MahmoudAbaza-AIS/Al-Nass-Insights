using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Insights.Application.Contracts;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Insights.IntegrationTests;

public class ApiContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly HttpClient _client;

    public ApiContractTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("Authentication:DisableForLocalDevelopment", "true");
            builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Development");
            builder.UseSetting("AppCache:Provider", "InMemory");
            builder.UseSetting("Synchronization:Enabled", "false");
            builder.UseSetting("Sources:Oracle:Enabled", "false");
            builder.UseSetting("Sources:SqlServerSymbols:RunMigrationsOnStartup", "false");
            builder.UseSetting("Sources:SqlServerSymbols:ConnectionString", "");
            builder.UseSetting("OpenApi:Enabled", "false");
        }).CreateClient();
    }

    [Fact]
    public async Task Health_Live_Is_Anonymous()
    {
        var response = await _client.GetAsync("/health/live");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Dashboards_Return_Seven_Modules()
    {
        var response = await _client.GetAsync("/api/v1/dashboards/");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<List<DashboardSummaryDto>>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal(7, body!.Count);
    }

    [Fact]
    public async Task Dashboard_Widgets_Never_Invent_Zero_When_Cache_Empty()
    {
        var response = await _client.GetAsync("/api/v1/dashboards/DASH-01");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<DashboardDetailDto>(JsonOptions);
        Assert.NotNull(body);
        Assert.NotEmpty(body!.Widgets);
        Assert.All(body.Widgets, w => Assert.Null(w.Value));
    }
}
