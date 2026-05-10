using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class UpdateRoomTypeRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Room type name cannot be empty or whitespace.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public List<string> ImageUrls { get; set; } = [];

        public List<string> Amenities { get; set; } = [];

        public List<string> MealOptions { get; set; } = [];

        [Range(1, int.MaxValue, ErrorMessage = "Capacity must be greater than zero.")]
        public int Capacity { get; set; }

        [Range(0.01, 1000000, ErrorMessage = "Price must be greater than zero.")]
        public decimal Price { get; set; }
    }
}
