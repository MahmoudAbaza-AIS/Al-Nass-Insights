using NetArchTest.Rules;

namespace Insights.ArchitectureTests;

public class LayerDependencyTests
{
    [Fact]
    public void Domain_Does_Not_Depend_On_Other_Layers()
    {
        var result = Types.InAssembly(typeof(Insights.Domain.Kpis.KpiValue).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "Insights.Application",
                "Insights.Infrastructure",
                "Insights.Presentation")
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Application_Does_Not_Depend_On_Infrastructure_Or_Presentation()
    {
        var result = Types.InAssembly(typeof(Insights.Application.DependencyInjection).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny("Insights.Infrastructure", "Insights.Presentation")
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }
}
