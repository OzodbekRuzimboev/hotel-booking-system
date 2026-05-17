using HotelBookingSystem.Api.Entities;
using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Admin
{
    public class CreateHotelRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Название отеля не может быть пустым или состоять только из пробелов.")]
        public required string Name { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public List<string> ImageUrls { get; set; } = [];

        public List<string> Amenities { get; set; } = [];

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Город не может быть пустым или состоять только из пробелов.")]
        public required string City { get; set; }

        [Required]
        [StringLength(200, MinimumLength = 5)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Адрес не может быть пустым или состоять только из пробелов.")]
        public required string Address { get; set; }

        public List<RoomTypeRequest> RoomTypes { get; set; } = [];
    }
}
