using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class CreateRoomRequest
    {
        [Required]
        [StringLength(20, MinimumLength = 1)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Номер комнаты не может быть пустым или состоять только из пробелов.")]
        public string Number { get; set; } = string.Empty;
    }
}
