using HotelBookingSystem.Api.Entities;
using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Admin
{
    public class RoomTypeRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Room type name cannot be empty or whitespace.")]
        public required string Name { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Capacity must be greater than zero.")]
        public int Capacity { get; set; }

        [Range(typeof(decimal), "0.01", "1000000", ErrorMessage = "Price must be greater than zero.")]
        public decimal Price { get; set; }

        public List<RoomRequest> Rooms { get; set; } = [];
    }
}
