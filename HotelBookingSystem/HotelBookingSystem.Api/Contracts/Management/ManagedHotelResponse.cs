namespace HotelBookingSystem.Api.Contracts.Management
{
    public class ManagedHotelResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string[] ImageUrls { get; set; } = [];
        public string[] Amenities { get; set; } = [];
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int? OwnerId { get; set; }
        public List<ManagedRoomTypeResponse> RoomTypes { get; set; } = [];
    }
}
