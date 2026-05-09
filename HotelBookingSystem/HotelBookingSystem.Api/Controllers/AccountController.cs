using HotelBookingSystem.Api.Contracts.Account;
using HotelBookingSystem.Api.Extensions;
using HotelBookingSystem.Api.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly AccountService _accountService;

        public AccountController(AccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var result = await _accountService.GetAccountAsync(User.GetUserId());
            return Ok(result);
        }

        [HttpPatch("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest req)
        {
            var result = await _accountService.UpdateProfileAsync(User.GetUserId(), req);
            return Ok(result);
        }

        [HttpPatch("settings")]
        public async Task<IActionResult> UpdateSettings(AccountSettingsRequest req)
        {
            var result = await _accountService.UpdateSettingsAsync(User.GetUserId(), req);
            return Ok(result);
        }

        [HttpGet("favorites")]
        public async Task<IActionResult> GetFavorites()
        {
            var result = await _accountService.GetFavoritesAsync(User.GetUserId());
            return Ok(result);
        }

        [HttpGet("favorites/{hotelId:int}")]
        public async Task<IActionResult> GetFavoriteStatus(int hotelId)
        {
            var result = await _accountService.IsFavoriteAsync(User.GetUserId(), hotelId);
            return Ok(new { isFavorite = result });
        }

        [HttpPost("favorites/{hotelId:int}")]
        public async Task<IActionResult> AddFavorite(int hotelId)
        {
            await _accountService.AddFavoriteAsync(User.GetUserId(), hotelId);
            return NoContent();
        }

        [HttpDelete("favorites/{hotelId:int}")]
        public async Task<IActionResult> RemoveFavorite(int hotelId)
        {
            await _accountService.RemoveFavoriteAsync(User.GetUserId(), hotelId);
            return NoContent();
        }
    }
}
