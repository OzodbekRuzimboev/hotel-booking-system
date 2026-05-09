namespace HotelBookingSystem.Api.Contracts.Management
{
    public class ManagedRoomTypeResponse
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int Capacity { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
        public int TotalRooms { get; set; }
        public int ActiveRooms { get; set; }
        public List<RoomResponse> Rooms { get; set; } = [];
    }
}
