using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Admin
{
    public class PopularDestinationRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "City cannot be empty or whitespace.")]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Country cannot be empty or whitespace.")]
        public string Country { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Image URL cannot be empty or whitespace.")]
        public string ImageUrl { get; set; } = string.Empty;

        [Range(0, 1000)]
        public int SortOrder { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
