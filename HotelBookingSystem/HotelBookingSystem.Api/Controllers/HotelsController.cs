using Microsoft.AspNetCore.Mvc;
using HotelBookingSystem.Api.Services;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        private readonly HotelService _service;

        public HotelsController(HotelService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetHotels()
        {
            var hotels = await _service.GetHotelsAsync();

            return Ok(hotels);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetHotelById(int id)
        {
            var response = await _service.GetHotelByIdAsync(id);

            return Ok(response);
        }

        [HttpGet("search")]
        public async Task<IActionResult> GetAvailableHotels(string city, DateOnly checkInDate, DateOnly checkOutDate, int guestsCount)
        {
            var hotels = await _service.GetAvailableHotelsAsync(city, checkInDate, checkOutDate, guestsCount);

            return Ok(hotels);
        }
    }
}
