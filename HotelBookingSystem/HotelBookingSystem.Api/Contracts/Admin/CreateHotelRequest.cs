using HotelBookingSystem.Api.Entities;

namespace HotelBookingSystem.Api.Contracts.Admin
{
    public class CreateHotelRequest
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string City { get; set; }
        public required string Address { get; set; }

        public List<RoomTypeRequest> RoomTypes { get; set; } = [];
    }
}
