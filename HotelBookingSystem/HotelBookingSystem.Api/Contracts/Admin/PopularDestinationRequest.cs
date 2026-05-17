using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Admin
{
    public class PopularDestinationRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Город не может быть пустым или состоять только из пробелов.")]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Страна не может быть пустой или состоять только из пробелов.")]
        public string Country { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        [RegularExpression(@".*\S.*", ErrorMessage = "URL изображения не может быть пустым или состоять только из пробелов.")]
        public string ImageUrl { get; set; } = string.Empty;

        [Range(0, 1000)]
        public int SortOrder { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
