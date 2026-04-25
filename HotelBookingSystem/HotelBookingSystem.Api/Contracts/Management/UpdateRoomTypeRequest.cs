namespace HotelBookingSystem.Api.Contracts.Management
{
    public class UpdateRoomTypeRequest
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public int Capacity { get; set; }
        public decimal Price { get; set; }
    }
}
