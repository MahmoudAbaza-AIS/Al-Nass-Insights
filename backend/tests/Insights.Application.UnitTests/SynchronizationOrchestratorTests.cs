using Insights.Application.Abstractions;
using Insights.Application.Sync;
using Insights.Domain.Kpis;
using Insights.Domain.Sync;
using Insights.Infrastructure.Persistence;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;

namespace Insights.Application.UnitTests;

public class SynchronizationOrchestratorTests
{
    [Fact]
    public async Task Failed_Oracle_Preserves_Last_Good_And_Does_Not_Publish_Zeros()
    {
        var cache = new InMemoryAppCacheStore();
        var good = new KpiValue
        {
            KpiId = CanonicalKpiId.Parse("opd.visits.attended"),
            Grain = KpiGrain.Day,
            PeriodStart = new DateOnly(2026, 10, 19),
            Value = 100m,
            CapturedAt = DateTimeOffset.UtcNow.AddHours(-1),
            QueryVersion = "OQ-02@v1-2026-10-05",
            SyncRunId = 1,
            State = KpiPublicationState.Fresh
        };
        await cache.PublishAtomicAsync(1, [good], CancellationToken.None);

        var oracle = Substitute.For<IOracleKpiSource>();
        oracle.FetchApprovedQueriesAsync(Arg.Any<IReadOnlyList<string>>(), Arg.Any<CancellationToken>())
            .Returns<Task<IReadOnlyList<SourceKpiObservation>>>(_ => throw new InvalidOperationException("oracle down"));

        var symbols = Substitute.For<ISqlServerSymbolSource>();
        symbols.FetchSymbolsAsync(Arg.Any<CancellationToken>()).Returns([]);

        var clock = Substitute.For<IClock>();
        clock.UtcNow.Returns(DateTimeOffset.Parse("2026-10-20T12:00:00Z"));

        var sut = new SynchronizationOrchestrator(cache, oracle, symbols, clock, NullLogger<SynchronizationOrchestrator>.Instance);
        var outcome = await sut.RunAsync(RefreshTier.Tier3Operational, CancellationToken.None);

        Assert.Equal(SyncRunOutcome.Failed, outcome);
        var latest = await cache.GetLatestAsync(CanonicalKpiId.Parse("opd.visits.attended"), string.Empty, CancellationToken.None);
        Assert.NotNull(latest);
        Assert.Equal(100m, latest!.Value);
    }

    [Fact]
    public async Task Overlapping_Lease_Skips_Duplicate_Work()
    {
        var cache = new InMemoryAppCacheStore();
        await cache.TryAcquireSyncLeaseAsync(RefreshTier.Tier3Operational, TimeSpan.FromHours(1), CancellationToken.None);

        var oracle = Substitute.For<IOracleKpiSource>();
        var symbols = Substitute.For<ISqlServerSymbolSource>();
        var clock = Substitute.For<IClock>();
        clock.UtcNow.Returns(DateTimeOffset.UtcNow);

        var sut = new SynchronizationOrchestrator(cache, oracle, symbols, clock, NullLogger<SynchronizationOrchestrator>.Instance);
        var outcome = await sut.RunAsync(RefreshTier.Tier3Operational, CancellationToken.None);

        Assert.Equal(SyncRunOutcome.SkippedOverlap, outcome);
        await oracle.DidNotReceive().FetchApprovedQueriesAsync(Arg.Any<IReadOnlyList<string>>(), Arg.Any<CancellationToken>());
    }
}
