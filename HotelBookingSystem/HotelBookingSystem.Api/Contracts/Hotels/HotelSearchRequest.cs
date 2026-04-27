namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class HotelSearchRequest
    {
        public required string City { get; set; }
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public int GuestsCount { get; set; }
    }
}
