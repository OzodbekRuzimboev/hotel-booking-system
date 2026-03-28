using HotelBookingSystem.Api.Contracts.Auth;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace HotelBookingSystem.Api.IntegrationTests
{
    public abstract class IntegrationTestBase
    {
        protected ApiFactory Factory { get; }
        protected HttpClient Client { get; }

        protected IntegrationTestBase(ApiFactory factory)
        {
            Factory = factory;
            Client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost")
            });
        }

        protected async Task<int> SeedRoomAsync()
        {
            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var hotel = new Hotel
            {
                Name = "Test Hotel",
                City = "Tashkent",
                Address = "Test address"
            };

            var room = new Room
            {
                Hotel = hotel,
                Name = "Standard 101",
                Capacity = 2,
                Price = 100
            };

            db.Rooms.Add(room);
            await db.SaveChangesAsync();

            return room.Id;
        }

        protected async Task<AuthResponse> RegisterAsync()
        {
            var email = $"{Guid.NewGuid():N}@test.com";

            var response = await Client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
            {
                Name = "Test User",
                Email = email,
                Password = "Password123"
            });

            response.EnsureSuccessStatusCode();

            var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
            return auth ?? throw new InvalidOperationException("Auth response is null.");
        }

        protected async Task<AuthResponse> RegisterAndAuthorizeAsync()
        {
            var auth = await RegisterAsync();
            Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);

            return auth;
        }
    }
}
