using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class PublicHotelDetailsRequest
    {
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Количество гостей должно быть больше нуля.")]
        public int GuestsCount { get; set; }
    }
}
