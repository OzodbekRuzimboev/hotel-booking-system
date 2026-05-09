namespace HotelBookingSystem.Api.Contracts.Account
{
    public class AccountSettingsResponse
    {
        public string PreferredCurrency { get; set; } = "USD";
        public string PreferredLanguage { get; set; } = "en";
        public bool EmailNotificationsEnabled { get; set; } = true;
    }
}
