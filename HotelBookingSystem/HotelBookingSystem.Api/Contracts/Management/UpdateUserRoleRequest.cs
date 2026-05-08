using HotelBookingSystem.Api.Enums;
using System.Text.Json.Serialization;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class UpdateUserRoleRequest
    {
        [JsonRequired]
        public Role Role { get; set; }
    }
}
