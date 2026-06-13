using HotelBookingSystem.Api.Enums;

namespace HotelBookingSystem.Api.Contracts.Account
{
    public class UserAccountResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Role Role { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Country { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}
