using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class PublicHotelDetailsRequest
    {
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Guests count must be greater than zero.")]
        public int GuestsCount { get; set; }
    }
}
