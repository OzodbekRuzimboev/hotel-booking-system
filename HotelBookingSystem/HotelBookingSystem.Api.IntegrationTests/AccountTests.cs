using FluentAssertions;
using HotelBookingSystem.Api.Contracts.Account;
using HotelBookingSystem.Api.Contracts.Auth;
using System.Net;
using System.Net.Http.Json;

namespace HotelBookingSystem.Api.IntegrationTests
{
    public sealed class AccountTests : IntegrationTestBase, IClassFixture<ApiFactory>
    {
        public AccountTests(ApiFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task ChangePassword_ShouldUpdatePassword()
        {
            await Factory.ResetDatabaseAsync();

            var auth = await RegisterAndAuthorizeAsync();

            var response = await Client.PatchAsJsonAsync("/api/account/password", new ChangePasswordRequest
            {
                CurrentPassword = "Password123",
                NewPassword = "NewPassword123"
            });

            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            var oldPasswordResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                Email = auth.Email,
                Password = "Password123"
            });

            oldPasswordResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            var newPasswordResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                Email = auth.Email,
                Password = "NewPassword123"
            });

            newPasswordResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }
}
