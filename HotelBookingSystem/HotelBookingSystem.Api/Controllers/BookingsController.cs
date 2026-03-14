using HotelBookingSystem.Api.Contracts;
using HotelBookingSystem.Api.Exceptions;
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
            try
            {
                var booking = await _service.CreateBookingAsync(req);

                return Ok(new BookingResponse
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    RoomId = booking.RoomId,
                    CheckInDate = booking.CheckInDate,
                    CheckOutDate = booking.CheckOutDate
                });
            }
            catch (AppException ex)
            {
                return StatusCode(ex.StatusCode, new
                {
                    error = ex.Message,
                    status = ex.StatusCode
                });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetBookings(int userId)
        {
            var bookings = await _service.GetBookingsAsync(userId);

            return Ok(bookings);
        }
    }
}
