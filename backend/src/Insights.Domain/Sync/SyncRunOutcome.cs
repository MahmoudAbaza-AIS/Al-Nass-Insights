namespace Insights.Domain.Sync;

public enum SyncRunOutcome
{
    Succeeded = 0,
    Partial = 1,
    Failed = 2,
    SkippedOverlap = 3,
    Cancelled = 4
}
