using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Contracts.Hotels;

namespace HotelBookingSystem.Api.IntegrationTests
{
    public sealed class HotelSearchAvailabilityTests : IntegrationTestBase, IClassFixture<ApiFactory>
    {
        public HotelSearchAvailabilityTests(ApiFactory factory) : base(factory) { }

        [Fact]
        public async Task Search_ShouldReflectAvailability_WhenBookingsAreCreated()
        {
            await Factory.ResetDatabaseAsync();

            var roomTypeId = await SeedRoomTypeAsync(roomCount: 2);
            var checkInDate = DateOnly.FromDateTime(DateTime.Today.AddDays(10));
            var checkOutDate = DateOnly.FromDateTime(DateTime.Today.AddDays(12));
            var searchUrl = BuildSearchUrl(checkInDate, checkOutDate, guestsCount: 2);

            var initialSearchResponse = await Client.GetAsync(searchUrl);
            initialSearchResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var initialHotels = await initialSearchResponse.Content.ReadFromJsonAsync<List<HotelSearchResponse>>();
            initialHotels.Should().NotBeNull();
            initialHotels.Should().ContainSingle();
            initialHotels![0].RoomTypes.Should().ContainSingle();
            initialHotels[0].RoomTypes[0].RoomTypeId.Should().Be(roomTypeId);
            initialHotels[0].RoomTypes[0].AvailableCount.Should().Be(2);

            await RegisterAndAuthorizeAsync();

            var bookingResponse = await Client.PostAsJsonAsync("/api/bookings", new CreateBookingRequest
            {
                RoomTypeId = roomTypeId,
                CheckInDate = checkInDate,
                CheckOutDate = checkOutDate,
                GuestsCount = 2
            });

            bookingResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var searchAfterBookingResponse = await Client.GetAsync(searchUrl);
            searchAfterBookingResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var hotelsAfterBooking = await searchAfterBookingResponse.Content.ReadFromJsonAsync<List<HotelSearchResponse>>();
            hotelsAfterBooking.Should().NotBeNull();
            hotelsAfterBooking.Should().ContainSingle();
            hotelsAfterBooking![0].RoomTypes.Should().ContainSingle();
            hotelsAfterBooking[0].RoomTypes[0].RoomTypeId.Should().Be(roomTypeId);
            hotelsAfterBooking[0].RoomTypes[0].AvailableCount.Should().Be(1);
        }

        private static string BuildSearchUrl(DateOnly checkInDate, DateOnly checkOutDate, int guestsCount)
        {
            return $"/api/hotels/search?City=Tashkent&CheckInDate={checkInDate:yyyy-MM-dd}&CheckOutDate={checkOutDate:yyyy-MM-dd}&GuestsCount={guestsCount}";
        }
    }
}
