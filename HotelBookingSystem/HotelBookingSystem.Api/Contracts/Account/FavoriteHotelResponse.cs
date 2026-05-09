namespace HotelBookingSystem.Api.Contracts.Account
{
    public class FavoriteHotelResponse
    {
        public int HotelId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public DateTime AddedAt { get; set; }
    }
}
