using FluentAssertions;
using HotelBookingSystem.Api.Contracts.Auth;
using HotelBookingSystem.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;

namespace HotelBookingSystem.Api.IntegrationTests
{
    public sealed class AuthTests : IntegrationTestBase, IClassFixture<ApiFactory>
    {
        public AuthTests(ApiFactory factory) : base(factory) { }

        [Fact]
        public async Task Register_ShouldCreateUserAndReturnToken()
        {
            await Factory.ResetDatabaseAsync();

            var request = new RegisterRequest
            {
                Name = "Test user",
                Email = "test@gmail.com",
                Password = "password123"
            };

            var response = await Client.PostAsJsonAsync("/api/Auth/register", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
            auth.Should().NotBeNull();
            auth!.Token.Should().NotBeNullOrWhiteSpace();
            auth.Email.Should().Be("test@gmail.com");
            auth.Name.Should().Be("Test user");

            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var user = await db.Users.SingleAsync();

            user.Email.Should().Be("test@gmail.com");
            user.Name.Should().Be("Test user");
            user.PasswordHash.Should().NotBeNullOrWhiteSpace();
            user.PasswordHash.Should().NotBe("password123");

            auth.UserId.Should().Be(user.Id);
        }

        [Fact]
        public async Task Login_ShouldReturn401_WhenPasswordIsInvalid()
        {
            await Factory.ResetDatabaseAsync();

            var registeredUser = await RegisterAsync();

            var request = new LoginRequest
            {
                Email = registeredUser.Email,
                Password = "WrongPassword123"
            };

            var response = await Client.PostAsJsonAsync("/api/Auth/login", request);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            problem.Should().NotBeNull();
            problem!.Detail.Should().Be("Invalid email or password.");
        }

        [Fact] 
        public async Task Register_ShouldReturn409_WhenEmailAlreadyExists()
        {
            await Factory.ResetDatabaseAsync();

            var firstRequest = new RegisterRequest
            {
                Name = "First User",
                Email = "user@example.com",
                Password = "Password123"
            };

            var secondRequest = new RegisterRequest
            {
                Name = "Second User",
                Email = "User@example.com",
                Password = "Password123"
            };

            var firstResponse = await Client.PostAsJsonAsync("/api/auth/register", firstRequest);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var secondResponse = await Client.PostAsJsonAsync("/api/auth/register", secondRequest);
            secondResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);

            var problem = await secondResponse.Content.ReadFromJsonAsync<ProblemDetails>();
            problem.Should().NotBeNull();
            problem!.Detail.Should().Be("Email already in use.");

            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var usersCount = await db.Users.CountAsync();
            usersCount.Should().Be(1);
        }
    }
}
