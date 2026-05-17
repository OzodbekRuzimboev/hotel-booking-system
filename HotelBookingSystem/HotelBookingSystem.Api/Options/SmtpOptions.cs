namespace HotelBookingSystem.Api.Options
{
    public class SmtpOptions
    {
        public string? Host { get; set; }
        public int Port { get; set; } = 587;
        public bool UseSsl { get; set; } = true;
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? FromAddress { get; set; }
        public string FromName { get; set; } = "StayFinder";
    }
}
