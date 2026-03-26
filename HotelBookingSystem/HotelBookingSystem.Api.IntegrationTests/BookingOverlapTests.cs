using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using HotelBookingSystem.Api.Contracts.Auth;
using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace HotelBookingSystem.Api.IntegrationTests
{
    public sealed class BookingOverlapTests : IClassFixture<ApiFactory>
    {
        private readonly ApiFactory _factory;
        private readonly HttpClient _client;

        public BookingOverlapTests(ApiFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost")
            });
        }

        [Fact]
        public async Task CreateBooking_ShouldReturn409_WhenDatesOverlapForSameRoom()
        {
            await _factory.ResetDatabaseAsync();

            var roomId = await SeedRoomAsync();

            var auth = await RegisterAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);

            var firstBooking = new CreateBookingRequest
            {
                RoomId = roomId,
                CheckInDate = new DateOnly(2026, 4, 10),
                CheckOutDate = new DateOnly(2026, 4, 12)
            };

            var overlapBooking = new CreateBookingRequest
            {
                RoomId = roomId,
                CheckInDate = new DateOnly(2026, 4, 11),
                CheckOutDate = new DateOnly(2026, 4, 13)
            };

            var firstResponse = await _client.PostAsJsonAsync("/api/bookings", firstBooking);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var secondResponse = await _client.PostAsJsonAsync("/api/bookings", overlapBooking);
            secondResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);

            var problem = await secondResponse.Content.ReadFromJsonAsync<ProblemDetails>();
            problem.Should().NotBeNull();
            problem!.Detail.Should().Be("Room is already booked for the selected dates.");
        }

        private async Task<int> SeedRoomAsync()
        {
            using var scope = _factory.Services.CreateScope();
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

        private async Task<AuthResponse> RegisterAsync()
        {
            var email = $"{Guid.NewGuid():N}@test.com";

            var response = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
            {
                Name = "Test User",
                Email = email,
                Password = "Password123"
            });

            response.EnsureSuccessStatusCode();

            var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
            return auth ?? throw new InvalidOperationException("Auth response is null.");
        }
    }
}
