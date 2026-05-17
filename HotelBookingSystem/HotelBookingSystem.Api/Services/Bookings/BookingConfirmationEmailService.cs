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
            var subject = $"Подтверждение бронирования #{booking.Id}";
            var body = $"""
                Ваше бронирование подтверждено.

                Номер бронирования: {booking.Id}
                Отель: {booking.HotelName}
                Тип номера: {booking.RoomTypeName}
                Даты: {booking.CheckInDate:yyyy-MM-dd} - {booking.CheckOutDate:yyyy-MM-dd}
                Гостей: {booking.GuestsCount}
                Итоговая цена: {booking.TotalPrice:C}

                Контактные данные:
                Email: {booking.GuestEmail}
                Страна: {booking.GuestCountry ?? "-"}
                Телефон: {booking.GuestPhoneNumber ?? "-"}
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
