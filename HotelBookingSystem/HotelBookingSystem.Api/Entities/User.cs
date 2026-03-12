namespace HotelBookingSystem.Api.Entities
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public string? PasswordHash { get; set; }

        public List<Booking> Bookings { get; set; } = [];
    }
}
