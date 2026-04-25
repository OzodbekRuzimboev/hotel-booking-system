using HotelBookingSystem.Api.Services;
using Microsoft.AspNetCore.Mvc;
using HotelBookingSystem.Api.Contracts.Auth;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _service;

        public AuthController(AuthService service)
        {
            _service = service;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest req)
        {
            var result = await _service.RegisterAsync(req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest req)
        {
            var result = await _service.LoginAsync(req);

            return Ok(result);
        }
    }
}
