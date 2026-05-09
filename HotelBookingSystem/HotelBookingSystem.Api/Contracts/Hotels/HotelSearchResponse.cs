namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class HotelSearchResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string City { get; set; } = null!;
        public string Address { get; set; } = null!;
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }

        public List<AvailableRoomTypeResponse> RoomTypes { get; set; } = [];
    }
}
