using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Account
{
    public class UpdateProfileRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [StringLength(40)]
        public string? PhoneNumber { get; set; }

        [StringLength(100)]
        public string? Country { get; set; }
    }
}
