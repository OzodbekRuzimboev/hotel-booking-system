namespace HotelBookingSystem.Api.Entities
{
    public class Hotel
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string City { get; set; }
        public required string Address { get; set; }

        public List<Room> Rooms { get; set; } = [];
    }
}
