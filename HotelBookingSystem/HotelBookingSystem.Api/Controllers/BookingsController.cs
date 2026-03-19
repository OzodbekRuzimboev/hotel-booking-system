using HotelBookingSystem.Api.Contracts;
using HotelBookingSystem.Api.Extentions;
using HotelBookingSystem.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _service;

        public BookingsController(BookingService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking(CreateBookingRequest req)
        {
            var userId = User.GetUserId();
            var booking = await _service.CreateBookingAsync(userId, req);

            return Ok(new BookingResponse
            {
                Id = booking.Id,
                UserId = booking.UserId,
                RoomId = booking.RoomId,
                CheckInDate = booking.CheckInDate,
                CheckOutDate = booking.CheckOutDate
            });
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = User.GetUserId();
            var bookings = await _service.GetBookingsAsync(userId);

            return Ok(bookings);
        }
    }
}
