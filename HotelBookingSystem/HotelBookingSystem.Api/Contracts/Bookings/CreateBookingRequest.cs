using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Bookings
{
    public class CreateBookingRequest : IValidatableObject
    {
        [Range(1, int.MaxValue, ErrorMessage = "RoomTypeId must be greater than zero.")]
        public int RoomTypeId { get; set; }

        public DateOnly CheckInDate { get; set; }

        public DateOnly CheckOutDate { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Guests count must be greater than zero.")]
        public int GuestsCount { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (CheckInDate == default)
                yield return new ValidationResult("CheckInDate is required.", [nameof(CheckInDate)]);

            if (CheckOutDate == default)
                yield return new ValidationResult("CheckOutDate is required.", [nameof(CheckOutDate)]);

            if (CheckOutDate <= CheckInDate)
                yield return new ValidationResult("CheckOutDate must be later than CheckInDate.", [nameof(CheckOutDate), nameof(CheckInDate)]);
        }
    }
}
