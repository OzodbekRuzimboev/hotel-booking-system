namespace HotelBookingSystem.Api.Entities
{
    public class RoomType
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = null!;

        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string[] ImageUrls { get; set; } = [];
        public string[] Amenities { get; set; } = [];
        public string[] MealOptions { get; set; } = [];
        public int Capacity { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; } = true;

        public List<Room> Rooms { get; set; } = [];
        public List<Review> Reviews { get; set; } = [];
    }
}
