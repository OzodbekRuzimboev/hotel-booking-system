using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Bookings
{
    public class CreateBookingRequest : IValidatableObject
    {
        [Range(1, int.MaxValue)]
        public int RoomTypeId { get; set; }

        public DateOnly CheckInDate { get; set; }

        public DateOnly CheckOutDate { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (CheckInDate == default)
                yield return new ValidationResult("CheckInDate is required.", new[] { nameof(CheckInDate) });

            if (CheckOutDate == default)
                yield return new ValidationResult("CheckOutDate is required.", new[] { nameof(CheckOutDate) });

            if (CheckOutDate <= CheckInDate)
                yield return new ValidationResult("CheckOutDate must be later than CheckInDate.", 
                    new[] { nameof(CheckOutDate), nameof(CheckInDate) });
        }
    }
}
