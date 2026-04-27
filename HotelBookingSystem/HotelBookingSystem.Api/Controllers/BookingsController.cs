using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Extensions;
using HotelBookingSystem.Api.Services.Bookings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _service;

        public BookingsController(BookingService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Policy = Permissions.BookingsCreateOwn)]
        public async Task<IActionResult> CreateBooking(CreateBookingRequest req)
        {
            var userId = User.GetUserId();
            var booking = await _service.CreateBookingAsync(userId, req);

            return StatusCode(StatusCodes.Status201Created, booking);
        }

        [HttpGet("my")]
        [Authorize(Policy = Permissions.BookingsReadOwn)]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = User.GetUserId();
            var bookings = await _service.GetUserBookingsAsync(userId);

            return Ok(bookings);
        }

        [HttpPatch("{id}/cancel")]
        [Authorize(Policy = Permissions.BookingsCancelOwn)]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userId = User.GetUserId();
            await _service.CancelUserBookingAsync(userId, id);

            return NoContent();
        }
    }
}
