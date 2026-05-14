namespace HotelBookingSystem.Api.Entities
{
    public class Room
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = null!;

        public int RoomTypeId { get; set; }
        public RoomType RoomType { get; set; } = null!;

        public required string Number { get; set; }
        public bool IsActive { get; set; } = true;

        public List<Booking> Bookings { get; set; } = [];
    }
}
