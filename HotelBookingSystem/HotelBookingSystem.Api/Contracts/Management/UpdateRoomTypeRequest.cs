using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class UpdateRoomTypeRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Название типа номера не может быть пустым или состоять только из пробелов.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public List<string> ImageUrls { get; set; } = [];

        public List<string> Amenities { get; set; } = [];

        public List<string> MealOptions { get; set; } = [];

        [Range(1, int.MaxValue, ErrorMessage = "Вместимость должна быть больше нуля.")]
        public int Capacity { get; set; }

        [Range(0.01, 1000000, ErrorMessage = "Цена должна быть больше нуля.")]
        public decimal Price { get; set; }
    }
}
