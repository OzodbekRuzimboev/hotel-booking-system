using HotelBookingSystem.Api.Enums;

namespace HotelBookingSystem.Api.Contracts.Auth
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken {  get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Role Role { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}
