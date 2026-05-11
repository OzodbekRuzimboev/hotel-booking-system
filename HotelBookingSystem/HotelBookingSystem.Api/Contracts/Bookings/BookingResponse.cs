namespace HotelBookingSystem.Api.Contracts.Bookings
{
    public class BookingResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public int HotelId { get; set; }
        public required string HotelName { get; set; }
        public string? HotelImageUrl { get; set; }
        public string[] HotelImageUrls { get; set; } = [];
        public required string RoomTypeName { get; set; }
        public required string RoomNumber { get; set; }
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public int GuestsCount { get; set; }
        public decimal TotalPrice { get; set; }
        public string GuestEmail { get; set; } = string.Empty;
        public string? GuestCountry { get; set; }
        public string? GuestPhoneNumber { get; set; }
        public BookingDisplayStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
    }
}
