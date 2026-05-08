using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Admin
{
    public class RoomRequest
    {
        [Required]
        [StringLength(20, MinimumLength = 1)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Room number cannot be empty or whitespace.")]
        public required string Number { get; set; }
    }
}
