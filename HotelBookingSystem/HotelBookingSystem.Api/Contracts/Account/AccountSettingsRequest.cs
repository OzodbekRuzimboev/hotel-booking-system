using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Account
{
    public class AccountSettingsRequest
    {
        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string PreferredCurrency { get; set; } = "USD";

        [Required]
        [StringLength(10, MinimumLength = 2)]
        public string PreferredLanguage { get; set; } = "en";

        public bool EmailNotificationsEnabled { get; set; } = true;
    }
}
