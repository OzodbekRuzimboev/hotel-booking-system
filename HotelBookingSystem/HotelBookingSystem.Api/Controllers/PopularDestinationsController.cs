using HotelBookingSystem.Api.Services.PopularDestinations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/popular-destinations")]
    public class PopularDestinationsController : ControllerBase
    {
        private readonly PopularDestinationService _service;

        public PopularDestinationsController(PopularDestinationService service)
        {
            _service = service;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPopularDestinations()
        {
            var destinations = await _service.GetPublicDestinationsAsync();

            return Ok(destinations);
        }
    }
}
