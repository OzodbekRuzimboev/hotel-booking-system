using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.IntegrationTests
{
    public sealed class BookingOverlapTests : IntegrationTestBase, IClassFixture<ApiFactory>
    {
        public BookingOverlapTests(ApiFactory factory) : base(factory) { }

        [Fact]
        public async Task CreateBooking_ShouldReturn409_WhenNoRoomsAvailableForOverlappingDates()
        {
            await Factory.ResetDatabaseAsync();

            var roomTypeId = await SeedRoomTypeAsync(roomCount: 1);

            await RegisterAndAuthorizeAsync();

            var firstBooking = new CreateBookingRequest
            {
                RoomTypeId = roomTypeId,
                CheckInDate = DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
                CheckOutDate = DateOnly.FromDateTime(DateTime.Today.AddDays(12)),
                GuestsCount = 2,
                GuestEmail = "guest@test.com"
            };

            var overlapBooking = new CreateBookingRequest
            {
                RoomTypeId = roomTypeId,
                CheckInDate = DateOnly.FromDateTime(DateTime.Today.AddDays(11)),
                CheckOutDate = DateOnly.FromDateTime(DateTime.Today.AddDays(13)),
                GuestsCount = 2,
                GuestEmail = "guest@test.com"
            };

            var firstResponse = await Client.PostAsJsonAsync("/api/bookings", firstBooking);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var secondResponse = await Client.PostAsJsonAsync("/api/bookings", overlapBooking);
            secondResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);

            var problem = await secondResponse.Content.ReadFromJsonAsync<ProblemDetails>();
            problem.Should().NotBeNull();
            problem!.Detail.Should().Be("На выбранные даты нет доступных номеров этого типа.");
        }

        [Fact]
        public async Task CreateBooking_ShouldSucceed_WhenDatesAreAdjacent()
        {
            await Factory.ResetDatabaseAsync();

            var roomTypeId = await SeedRoomTypeAsync(roomCount: 1);

            await RegisterAndAuthorizeAsync();

            var firstBooking = new CreateBookingRequest
            {
                RoomTypeId = roomTypeId,
                CheckInDate = DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
                CheckOutDate = DateOnly.FromDateTime(DateTime.Today.AddDays(12)),
                GuestsCount = 2,
                GuestEmail = "guest@test.com"
            };

            var adjacentBooking = new CreateBookingRequest
            {
                RoomTypeId = roomTypeId,
                CheckInDate = DateOnly.FromDateTime(DateTime.Today.AddDays(12)),
                CheckOutDate = DateOnly.FromDateTime(DateTime.Today.AddDays(15)),
                GuestsCount = 2,
                GuestEmail = "guest@test.com"
            };

            var firstResponse = await Client.PostAsJsonAsync("/api/bookings", firstBooking);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var secondResponse = await Client.PostAsJsonAsync("/api/bookings", adjacentBooking);
            secondResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var bookingsCount = await db.Bookings.CountAsync();
            bookingsCount.Should().Be(2);
        }
    }
}
