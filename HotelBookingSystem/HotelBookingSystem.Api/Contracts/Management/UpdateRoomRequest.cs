using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class UpdateRoomRequest
    {
        [Required]
        [StringLength(20, MinimumLength = 1)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Room number cannot be empty or whitespace.")]
        public required string Number { get; set; }
    }
}
