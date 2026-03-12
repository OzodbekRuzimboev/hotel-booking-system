namespace HotelBookingSystem.Api.Contracts
{
    public class HotelResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Address { get; set; } = null!;
    }
}
