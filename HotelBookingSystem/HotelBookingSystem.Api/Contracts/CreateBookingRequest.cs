namespace HotelBookingSystem.Api.Contracts
{
    public class CreateBookingRequest
    {
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
    }
}
