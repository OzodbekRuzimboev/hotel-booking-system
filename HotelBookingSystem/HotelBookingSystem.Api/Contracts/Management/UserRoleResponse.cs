using HotelBookingSystem.Api.Enums;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class UserRoleResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Role Role { get; set; }
    }
}
