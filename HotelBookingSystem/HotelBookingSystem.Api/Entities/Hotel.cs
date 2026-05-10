namespace HotelBookingSystem.Api.Entities
{
    public class Hotel
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string[] ImageUrls { get; set; } = [];
        public string[] Amenities { get; set; } = [];
        public required string City { get; set; }
        public required string Address { get; set; }

        public bool IsActive { get; set; } = true;

        public int? OwnerId { get; set; }
        public User? Owner { get; set; }

        public List<RoomType> RoomTypes { get; set; } = [];
        public List<FavoriteHotel> Favorites { get; set; } = [];
        public List<Review> Reviews { get; set; } = [];
    }
}
