using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Admin
{
    public class RoomRequest
    {
        [Required]
        [StringLength(20, MinimumLength = 1)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Номер комнаты не может быть пустым или состоять только из пробелов.")]
        public required string Number { get; set; }
    }
}
