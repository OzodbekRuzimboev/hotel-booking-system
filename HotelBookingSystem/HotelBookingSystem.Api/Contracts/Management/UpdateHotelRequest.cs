namespace HotelBookingSystem.Api.Contracts.Management
{
    public class UpdateHotelRequest
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string City { get; set; }
        public required string Address { get; set; }
    }
}
