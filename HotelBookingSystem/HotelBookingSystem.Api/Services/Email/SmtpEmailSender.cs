using HotelBookingSystem.Api.Options;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace HotelBookingSystem.Api.Services.Email
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly SmtpOptions _options;
        private readonly ILogger<SmtpEmailSender> _logger;

        public SmtpEmailSender(IOptions<SmtpOptions> options, ILogger<SmtpEmailSender> logger)
        {
            _options = options.Value;
            _logger = logger;
        }

        public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_options.Host) || string.IsNullOrWhiteSpace(_options.FromAddress))
            {
                _logger.LogInformation(
                    "SMTP is not configured. Booking confirmation for {Recipient}: {Subject}",
                    message.To,
                    message.Subject);
                return;
            }

            using var mail = new MailMessage
            {
                From = new MailAddress(_options.FromAddress, _options.FromName),
                Subject = message.Subject,
                Body = message.Body,
                IsBodyHtml = false
            };

            mail.To.Add(message.To);

            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                EnableSsl = _options.UseSsl
            };

            if (!string.IsNullOrWhiteSpace(_options.UserName))
            {
                client.Credentials = new NetworkCredential(_options.UserName, _options.Password);
            }

            await client.SendMailAsync(mail, cancellationToken);
        }
    }
}
