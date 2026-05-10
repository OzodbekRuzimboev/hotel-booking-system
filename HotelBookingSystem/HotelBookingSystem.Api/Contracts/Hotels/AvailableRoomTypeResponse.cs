namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class AvailableRoomTypeResponse
    {
        public int RoomTypeId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string[] ImageUrls { get; set; } = [];
        public string[] Amenities { get; set; } = [];
        public string[] MealOptions { get; set; } = [];
        public int Capacity { get; set; }
        public decimal Price { get; set; }
        public int AvailableCount { get; set; }
    }
}
