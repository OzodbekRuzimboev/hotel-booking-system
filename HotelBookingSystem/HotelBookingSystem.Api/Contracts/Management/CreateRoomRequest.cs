using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class CreateRoomRequest
    {
        [Required]
        [StringLength(20, MinimumLength = 1)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Room number cannot be empty or whitespace.")]
        public string Number { get; set; } = string.Empty;
    }
}
