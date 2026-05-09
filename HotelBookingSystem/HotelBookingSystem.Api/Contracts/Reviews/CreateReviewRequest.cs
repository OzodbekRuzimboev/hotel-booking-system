using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Reviews
{
    public class CreateReviewRequest
    {
        [Range(1, int.MaxValue)]
        public int RoomTypeId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(2000)]
        public string? Comment { get; set; }
    }
}
