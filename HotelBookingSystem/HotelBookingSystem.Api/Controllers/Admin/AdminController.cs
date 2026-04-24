using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController(AdminService service) : ControllerBase
    {
        [HttpPost]
        [Authorize(Policy = Permissions.HotelsCreate)]
        public async Task<IActionResult> CreateHotel(CreateHotelRequest req)
        {
            var result = await service.CreateHotelAsync(req);

            return Ok(result);
        }
    }
}
