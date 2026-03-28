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
    public sealed class BookingValidationTests : IntegrationTestBase, IClassFixture<ApiFactory>
    {
        public BookingValidationTests(ApiFactory factory) : base (factory) { }

        [Fact]
        public async Task CreatingBooking_ShouldReturn400_WhenDateRangeIsInvalid()
        {
            await Factory.ResetDatabaseAsync();

            var roomId = await SeedRoomAsync();

            await RegisterAndAuthorizeAsync();

            var invalidBooking = new CreateBookingRequest
            {
                RoomId = roomId,
                CheckInDate = new DateOnly(2026, 4, 16),
                CheckOutDate = new DateOnly(2026, 4, 13)
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
