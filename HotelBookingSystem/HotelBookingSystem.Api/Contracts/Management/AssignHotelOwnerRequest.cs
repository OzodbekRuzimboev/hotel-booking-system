using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class AssignHotelOwnerRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "OwnerId must be greater than zero.")]
        public int OwnerId { get; set; }
    }
}
