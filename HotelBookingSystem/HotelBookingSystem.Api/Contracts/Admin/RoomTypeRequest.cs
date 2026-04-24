using HotelBookingSystem.Api.Entities;

namespace HotelBookingSystem.Api.Contracts.Admin
{
    public class RoomTypeRequest
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public int Capacity { get; set; }
        public decimal Price { get; set; }

        public List<RoomRequest> Rooms { get; set; } = [];
    }
}
