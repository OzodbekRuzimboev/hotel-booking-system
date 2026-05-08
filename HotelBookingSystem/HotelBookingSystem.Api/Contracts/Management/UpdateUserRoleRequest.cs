using HotelBookingSystem.Api.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HotelBookingSystem.Api.Contracts.Management
{
    public class UpdateUserRoleRequest
    {
        [JsonRequired]
        public Role Role { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (!Enum.IsDefined(Role))
            {
                yield return new ValidationResult("Invalid role.", [nameof(Role)]);
            }
        }
    }
}
