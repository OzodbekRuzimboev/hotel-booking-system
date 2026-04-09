namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class HotelDetailsResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string City { get; set; } = null!;
        public string Address { get; set; } = null!;

        public List<RoomTypeResponse> RoomTypes { get; set; } = [];
    }
}
