using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Auth
{
    public class RevokeRefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
