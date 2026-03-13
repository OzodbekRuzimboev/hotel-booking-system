using HotelBookingSystem.Api.Contracts;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Exceptions;
using HotelBookingSystem.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly BookingService _service;

        public BookingsController(AppDbContext context, BookingService service)
        {
            _context = context;
            _service = service;
        }

        [HttpPost]
        public IActionResult CreateBooking(CreateBookingRequest req)
        {
            try
            {
                var booking = _service.CreateBooking(req);

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
        public IActionResult GetBookings(int userId)
        {
            var bookings = _service.GetBookings(userId);

            return Ok(bookings);
        }
    }
}
