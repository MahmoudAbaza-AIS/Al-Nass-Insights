using Insights.Application.Abstractions;
using Insights.Application.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;

namespace Insights.Application.UnitTests;

public class LoginCommandTests
{
    [Fact]
    public async Task Rejects_Empty_Credentials()
    {
        var users = Substitute.For<IUserStore>();
        var tokens = Substitute.For<IJwtTokenService>();
        var clock = Substitute.For<IClock>();
        var sut = new LoginCommand(users, tokens, clock, NullLogger<LoginCommand>.Instance);

        var result = await sut.ExecuteAsync(" ", "", CancellationToken.None);

        Assert.False(result.Success);
        await users.DidNotReceiveWithAnyArgs().FindByUsernameAsync(default!, default);
    }

    [Fact]
    public async Task Rejects_Oversized_Username()
    {
        var users = Substitute.For<IUserStore>();
        var tokens = Substitute.For<IJwtTokenService>();
        var clock = Substitute.For<IClock>();
        var sut = new LoginCommand(users, tokens, clock, NullLogger<LoginCommand>.Instance);

        var result = await sut.ExecuteAsync(new string('a', 129), "password", CancellationToken.None);

        Assert.False(result.Success);
        await users.DidNotReceiveWithAnyArgs().FindByUsernameAsync(default!, default);
    }

    [Fact]
    public async Task Succeeds_With_Valid_Password()
    {
        var hasher = new PasswordHasher<AppUser>();
        var user = new AppUser(
            Guid.NewGuid(),
            "demo",
            "demo@alnass.local",
            string.Empty,
            "Demo User",
            "Al Nass Hospital",
            ["executive"],
            ["*"],
            true);
        user = user with { PasswordHash = hasher.HashPassword(user, "Demo123!") };

        var users = Substitute.For<IUserStore>();
        users.FindByUsernameAsync("demo", Arg.Any<CancellationToken>()).Returns(user);

        var issued = new AuthTokenResult(
            "token",
            DateTimeOffset.UtcNow.AddHours(1),
            "Bearer",
            user);
        var tokens = Substitute.For<IJwtTokenService>();
        tokens.CreateToken(user).Returns(issued);

        var clock = Substitute.For<IClock>();
        clock.UtcNow.Returns(DateTimeOffset.UtcNow);

        var sut = new LoginCommand(users, tokens, clock, NullLogger<LoginCommand>.Instance);
        var result = await sut.ExecuteAsync("demo", "Demo123!", CancellationToken.None);

        Assert.True(result.Success);
        Assert.Equal("token", result.Token!.AccessToken);
        await users.Received(1).UpdateLastLoginAsync(user.UserId, Arg.Any<DateTimeOffset>(), Arg.Any<CancellationToken>());
    }
}
