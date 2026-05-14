namespace HotelBookingSystem.Api.Entities
{
    public class PopularDestination
    {
        public int Id { get; set; }
        public required string City { get; set; }
        public required string Country { get; set; }
        public required string ImageUrl { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
