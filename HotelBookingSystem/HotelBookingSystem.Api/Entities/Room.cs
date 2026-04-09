namespace HotelBookingSystem.Api.Entities
{
    public class Room
    {
        public int Id { get; set; }
        public int RoomTypeId { get; set; }
        public RoomType RoomType { get; set; } = null!;

        public required string Number { get; set; }

        public List<Booking> Bookings { get; set; } = [];
    }
}
