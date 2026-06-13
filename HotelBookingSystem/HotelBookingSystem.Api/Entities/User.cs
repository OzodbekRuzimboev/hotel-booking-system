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
        public string? PhoneNumber { get; set; }
        public string? Country { get; set; }
        public string? ProfileImageUrl { get; set; }

        public List<Booking> Bookings { get; set; } = [];
        public List<FavoriteHotel> FavoriteHotels { get; set; } = [];
        public List<Review> Reviews { get; set; } = [];
    }
}
