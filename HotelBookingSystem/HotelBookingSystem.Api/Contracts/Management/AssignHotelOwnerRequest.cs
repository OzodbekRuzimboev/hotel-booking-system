using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class AssignHotelOwnerRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "Идентификатор владельца должен быть больше нуля.")]
        public int OwnerId { get; set; }
    }
}
