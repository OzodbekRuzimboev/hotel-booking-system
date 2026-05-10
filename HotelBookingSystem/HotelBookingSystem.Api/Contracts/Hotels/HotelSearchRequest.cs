using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class HotelSearchRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "City cannot be empty or whitespace.")]
        public required string City { get; set; }

        public DateOnly CheckInDate { get; set; }

        public DateOnly CheckOutDate { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Guests count must be greater than zero.")]
        public int GuestsCount { get; set; }

        [Range(0.01, 1000000)]
        public decimal? MinNightlyPrice { get; set; }

        [Range(0.01, 1000000)]
        public decimal? MaxNightlyPrice { get; set; }

        public List<string> HotelAmenities { get; set; } = [];

        public List<string> RoomAmenities { get; set; } = [];

        public List<string> MealOptions { get; set; } = [];
    }
}
