using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Contracts.Hotels;
using HotelBookingSystem.Api.Contracts.Reviews;
using HotelBookingSystem.Api.Extensions;
using HotelBookingSystem.Api.Services.Hotels;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        private readonly HotelSearchService _searchService;
        private readonly HotelManagementService _managementService;
        private readonly ReviewService _reviewService;

        public HotelsController(HotelSearchService searchService, HotelManagementService managementService, ReviewService reviewService)
        {
            _searchService = searchService;
            _managementService = managementService;
            _reviewService = reviewService;
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

        [HttpGet("{id:int}/reviews")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviews(int id)
        {
            var result = await _reviewService.GetHotelReviewsAsync(id);
            return Ok(result);
        }

        [HttpPost("{id:int}/reviews")]
        [Authorize]
        public async Task<IActionResult> CreateReview(int id, CreateReviewRequest req)
        {
            var result = await _reviewService.CreateOrUpdateReviewAsync(User.GetUserId(), id, req);
            return Ok(result);
        }
    }
}
