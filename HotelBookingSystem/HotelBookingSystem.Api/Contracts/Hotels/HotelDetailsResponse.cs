namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class HotelDetailsResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string[] ImageUrls { get; set; } = [];
        public string City { get; set; } = null!;
        public string Address { get; set; } = null!;
        public bool IsActive { get; set; }
        public int? OwnerId { get; set; }

        public List<RoomTypeResponse> RoomTypes { get; set; } = [];
    }
}
