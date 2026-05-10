namespace HotelBookingSystem.Api.Contracts.Hotels
{
    public class RoomTypeResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string[] ImageUrls { get; set; } = [];
        public int Capacity { get; set; }
        public decimal Price { get; set; }
        public int TotalCount { get; set; }
    }
}
