namespace HotelBookingSystem.Api.Entities
{
    public class UserSettings
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public string PreferredCurrency { get; set; } = "USD";
        public string PreferredLanguage { get; set; } = "en";
        public bool EmailNotificationsEnabled { get; set; } = true;
    }
}
