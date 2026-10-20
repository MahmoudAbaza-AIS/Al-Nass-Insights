using Insights.Infrastructure.Options;
using Insights.Infrastructure.Sources.SqlServer;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace Insights.Infrastructure.UnitTests;

public class SqlServerSymbolSourceTests
{
    [Fact]
    public async Task Refuses_Non_Allowlisted_Object_Name()
    {
        var opts = Microsoft.Extensions.Options.Options.Create(new SqlServerSymbolOptions
        {
            Enabled = true,
            ConnectionString = "Server=.;Database=x;Trusted_Connection=True;",
            SymbolsObject = "dbo.Symbols; DROP TABLE dbo.X--"
        });

        var sut = new SqlServerSymbolSource(opts, NullLogger<SqlServerSymbolSource>.Instance);
        var rows = await sut.FetchSymbolsAsync(CancellationToken.None);
        Assert.Empty(rows);
    }
}
