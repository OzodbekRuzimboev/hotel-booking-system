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
        private readonly HotelSearchService _searchService;
        private readonly HotelManagementService _managementService;

        public HotelsController(HotelSearchService searchService, HotelManagementService managementService)
        {
            _searchService = searchService;
            _managementService = managementService;
        }

        [HttpGet]
        [Authorize(Policy = Permissions.HotelsReadAny)]
        public async Task<IActionResult> GetHotels()
        {
            var hotels = await _managementService.GetHotelsAsync();

            return Ok(hotels);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.HotelsReadAny)]
        public async Task<IActionResult> GetHotelById(int id)
        {
            var response = await _managementService.GetHotelByIdAsync(id);

            return Ok(response);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableHotels([FromQuery] HotelSearchRequest req)
        {
            var hotels = await _searchService.GetAvailableHotelsAsync(req);

            return Ok(hotels);
        }

        [HttpGet("{id}/details")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicHotelDetails(int id, [FromQuery] PublicHotelDetailsRequest req)
        {
            var hotel = await _searchService.GetPublicHotelDetailsAsync(id, req);

            return Ok(hotel);
        }
    }
}
