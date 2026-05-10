using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Services.Email;

namespace HotelBookingSystem.Api.Services.Bookings
{
    public class BookingConfirmationEmailService
    {
        private readonly IEmailSender _emailSender;
        private readonly ILogger<BookingConfirmationEmailService> _logger;

        public BookingConfirmationEmailService(
            IEmailSender emailSender,
            ILogger<BookingConfirmationEmailService> logger)
        {
            _emailSender = emailSender;
            _logger = logger;
        }

        public async Task SendBookingConfirmationAsync(BookingResponse booking)
        {
            var subject = $"Booking confirmation #{booking.Id}";
            var body = $"""
                Your booking is confirmed.

                Booking number: {booking.Id}
                Hotel: {booking.HotelName}
                Room type: {booking.RoomTypeName}
                Dates: {booking.CheckInDate:yyyy-MM-dd} to {booking.CheckOutDate:yyyy-MM-dd}
                Guests: {booking.GuestsCount}
                Total price: {booking.TotalPrice:C}

                Contact details:
                Email: {booking.GuestEmail}
                Country: {booking.GuestCountry ?? "-"}
                Phone: {booking.GuestPhoneNumber ?? "-"}
                """;

            try
            {
                await _emailSender.SendAsync(new EmailMessage(booking.GuestEmail, subject, body));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Booking confirmation email could not be sent. BookingId={BookingId}, Email={Email}",
                    booking.Id,
                    booking.GuestEmail);
            }
        }
    }
}
