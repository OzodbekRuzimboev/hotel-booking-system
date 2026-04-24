using HotelBookingSystem.Api.Enums;

namespace HotelBookingSystem.Api.Entities
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public Role Role { get; set; } = Role.User;

        public List<Booking> Bookings { get; set; } = [];
    }
}
