using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Contracts.Hotels;
using HotelBookingSystem.Api.Services.Hotels;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        private readonly HotelSearchService _service;

        public HotelsController(HotelSearchService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Policy = Permissions.HotelsReadAny)]
        public async Task<IActionResult> GetHotels()
        {
            var hotels = await _service.GetHotelsAsync();

            return Ok(hotels);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.HotelsReadAny)]
        public async Task<IActionResult> GetHotelById(int id)
        {
            var response = await _service.GetHotelByIdAsync(id);

            return Ok(response);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableHotels([FromQuery] HotelSearchRequest req)
        {
            var hotels = await _service.GetAvailableHotelsAsync(req);

            return Ok(hotels);
        }
    }
}
