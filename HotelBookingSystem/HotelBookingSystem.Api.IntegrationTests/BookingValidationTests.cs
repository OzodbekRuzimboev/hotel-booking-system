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
    public sealed class BookingValidationTests : IntegrationTestBase, IClassFixture<ApiFactory>
    {
        public BookingValidationTests(ApiFactory factory) : base (factory) { }

        [Fact]
        public async Task CreatingBooking_ShouldReturn400_WhenDateRangeIsInvalid()
        {
            await Factory.ResetDatabaseAsync();

            var roomTypeId = await SeedRoomTypeAsync();

            await RegisterAndAuthorizeAsync();

            var invalidBooking = new CreateBookingRequest
            {
                RoomTypeId = roomTypeId,
                CheckInDate = DateOnly.FromDateTime(DateTime.Today.AddDays(16)),
                CheckOutDate = DateOnly.FromDateTime(DateTime.Today.AddDays(12)),
                GuestsCount = 2,
                GuestEmail = "guest@test.com"
            };

            var response = await Client.PostAsJsonAsync("/api/bookings", invalidBooking);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
            problem.Should().NotBeNull();

            var allErrors = problem!.Errors.SelectMany(x => x.Value);
            allErrors.Should().Contain(error => error.Contains("CheckOutDate must be later than CheckInDate."));

            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var bookingsCount = await db.Bookings.CountAsync();
            bookingsCount.Should().Be(0);
        }
    }
}
