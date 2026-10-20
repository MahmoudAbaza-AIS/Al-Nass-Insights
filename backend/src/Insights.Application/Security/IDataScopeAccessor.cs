namespace Insights.Application.Security;

public interface IDataScopeAccessor
{
    DataScope GetRequiredScope();
}
