namespace HotelBookingSystem.Api.Contracts
{
    public class RoomResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Capacity { get; set; }
        public decimal Price { get; set; }
    }
}
