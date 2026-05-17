using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class HotelSearchRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Город не может быть пустым или состоять только из пробелов.")]
        public required string City { get; set; }

        public DateOnly CheckInDate { get; set; }

        public DateOnly CheckOutDate { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Количество гостей должно быть больше нуля.")]
        public int GuestsCount { get; set; }

        [Range(0.01, 1000000, ErrorMessage = "Минимальная цена за ночь должна быть больше нуля.")]
        public decimal? MinNightlyPrice { get; set; }

        [Range(0.01, 1000000, ErrorMessage = "Максимальная цена за ночь должна быть больше нуля.")]
        public decimal? MaxNightlyPrice { get; set; }

        public List<string> HotelAmenities { get; set; } = [];

        public List<string> RoomAmenities { get; set; } = [];

        public List<string> MealOptions { get; set; } = [];
    }
}
