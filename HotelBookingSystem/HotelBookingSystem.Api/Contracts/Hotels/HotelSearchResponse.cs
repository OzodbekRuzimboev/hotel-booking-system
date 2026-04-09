namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class HotelSearchResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Address { get; set; } = null!;
        public List<AvailableRoomTypeResponse> RoomTypes { get; set; } = [];
    }
}
