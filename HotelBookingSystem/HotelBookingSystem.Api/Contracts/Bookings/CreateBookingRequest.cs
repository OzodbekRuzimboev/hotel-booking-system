using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Bookings
{
    public class CreateBookingRequest : IValidatableObject
    {
        [Range(1, int.MaxValue, ErrorMessage = "Идентификатор типа номера должен быть больше нуля.")]
        public int RoomTypeId { get; set; }

        public DateOnly CheckInDate { get; set; }

        public DateOnly CheckOutDate { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Количество гостей должно быть больше нуля.")]
        public int GuestsCount { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(256)]
        public string GuestEmail { get; set; } = string.Empty;

        [StringLength(100)]
        public string? GuestCountry { get; set; }

        [StringLength(40)]
        public string? GuestPhoneNumber { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (CheckInDate == default)
                yield return new ValidationResult("Дата заезда обязательна.", [nameof(CheckInDate)]);

            if (CheckOutDate == default)
                yield return new ValidationResult("Дата выезда обязательна.", [nameof(CheckOutDate)]);

            if (CheckOutDate <= CheckInDate)
                yield return new ValidationResult("Дата выезда должна быть позже даты заезда.", [nameof(CheckOutDate), nameof(CheckInDate)]);
        }
    }
}
