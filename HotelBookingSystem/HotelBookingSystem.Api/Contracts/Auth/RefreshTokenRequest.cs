using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Auth
{
    public class RefreshTokenRequest
    {
        [Required]
        [StringLength(512, MinimumLength = 20)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Refresh token cannot be empty or whitespace.")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
