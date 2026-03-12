namespace HotelBookingSystem.Api.Contracts
{
    public class BookingResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
    }
}
