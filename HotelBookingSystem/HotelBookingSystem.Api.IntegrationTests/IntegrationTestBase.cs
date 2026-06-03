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
            Client = CreateClient();
        }

        protected HttpClient CreateClient()
        {
            return Factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost")
            });
        }

        protected async Task<int> SeedRoomTypeAsync(
            int roomCount = 1,
            int capacity = 2,
            decimal price = 100m,
            bool hotelIsActive = true,
            bool roomTypeIsActive = true,
            bool roomsAreActive = true)
        {
            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var hotel = new Hotel
            {
                Name = "Test Hotel",
                City = "Tashkent",
                Address = "Test address",
                IsActive = hotelIsActive
            };

            var roomType = new RoomType
            {
                Hotel = hotel,
                Name = "Standard",
                Description = "Standard test room type",
                Capacity = capacity,
                Price = price,
                IsActive = roomTypeIsActive
            };

            for (var i = 1; i <= roomCount; i++)
            {
                roomType.Rooms.Add(new Room
                {
                    Hotel = hotel,
                    Number = $"10{i}",
                    IsActive = roomsAreActive
                });
            }

            db.RoomTypes.Add(roomType);
            await db.SaveChangesAsync();

            return roomType.Id;
        }

        protected async Task<AuthResponse> RegisterAsync(string? email = null)
        {
            email ??= $"{Guid.NewGuid():N}@test.com";

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

        protected async Task<AuthResponse> RegisterAndAuthorizeAsync(string? email = null)
        {
            var auth = await RegisterAsync(email);
            Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

            return auth;
        }
    }
}
