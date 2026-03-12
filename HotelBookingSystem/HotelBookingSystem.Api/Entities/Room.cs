namespace HotelBookingSystem.Api.Entities
{
    public class Room
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = null!;
        public required string Name { get; set; }
        public string? Description { get; set; }
        public int Capacity { get; set; }
        public decimal Price { get; set; }

        public List<Booking> Bookings { get; set; } = [];
    }
}
