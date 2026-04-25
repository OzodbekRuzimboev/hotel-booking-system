namespace HotelBookingSystem.Api.Contracts.Management
{
    public class RoomResponse
    {
        public int Id { get; set; }
        public int RoomTypeId { get; set; }
        public string Number { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
