using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class UpdateHotelRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Hotel name cannot be empty or whitespace.")]
        public required string Name { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "City cannot be empty or whitespace.")]
        public required string City { get; set; }

        [Required]
        [StringLength(200, MinimumLength = 5)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Address cannot be empty or whitespace.")]
        public required string Address { get; set; }
    }
}
