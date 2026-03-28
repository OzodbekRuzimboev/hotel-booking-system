using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using HotelBookingSystem.Api.Contracts.Auth;
using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.IntegrationTests
{
    public sealed class BookingOverlapTests : IntegrationTestBase, IClassFixture<ApiFactory>
    {
        public BookingOverlapTests(ApiFactory factory) : base(factory) { }

        [Fact]
        public async Task CreateBooking_ShouldReturn409_WhenDatesOverlapForSameRoom()
        {
            await Factory.ResetDatabaseAsync();

            var roomId = await SeedRoomAsync();

            await RegisterAndAuthorizeAsync();

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

            var firstResponse = await Client.PostAsJsonAsync("/api/bookings", firstBooking);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var secondResponse = await Client.PostAsJsonAsync("/api/bookings", overlapBooking);
            secondResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);

            var problem = await secondResponse.Content.ReadFromJsonAsync<ProblemDetails>();
            problem.Should().NotBeNull();
            problem!.Detail.Should().Be("Room is already booked for the selected dates.");
        }

        [Fact]
        public async Task CreateBooking_ShouldSucceed_WhenDatesAreAdjacent()
        {
            await Factory.ResetDatabaseAsync();

            var roomId = await SeedRoomAsync();

            await RegisterAndAuthorizeAsync();

            var firstBooking = new CreateBookingRequest
            {
                RoomId = roomId,
                CheckInDate = new DateOnly(2026, 4, 10),
                CheckOutDate = new DateOnly(2026, 4, 12)
            };

            var adjacentBooking = new CreateBookingRequest
            {
                RoomId = roomId,
                CheckInDate = new DateOnly(2026, 4, 12),
                CheckOutDate = new DateOnly(2026, 4, 15)
            };

            var firstResponse = await Client.PostAsJsonAsync("/api/bookings", firstBooking);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var secondResponse = await Client.PostAsJsonAsync("/api/bookings", adjacentBooking);
            secondResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var bookingsCount = await db.Bookings.CountAsync();
            bookingsCount.Should().Be(2);
        }
    }
}
