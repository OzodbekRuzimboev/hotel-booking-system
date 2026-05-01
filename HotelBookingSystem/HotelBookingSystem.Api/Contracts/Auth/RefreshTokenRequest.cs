using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Auth
{
    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
