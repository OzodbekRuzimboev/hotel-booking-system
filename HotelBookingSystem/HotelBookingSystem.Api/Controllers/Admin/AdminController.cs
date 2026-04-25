using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Extensions;
using HotelBookingSystem.Api.Services;
using HotelBookingSystem.Api.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController(AdminService adminService, ManagementService managementService) : ControllerBase
    {
        [HttpPost]
        [Authorize(Policy = Permissions.HotelsCreate)]
        public async Task<IActionResult> CreateHotel(CreateHotelRequest req)
        {
            var hotel = await adminService.CreateHotelAsync(req);

            return StatusCode(StatusCodes.Status201Created, hotel);
        }

        [HttpPatch("hotels/{hotelId:int}")]
        [Authorize(Policy = Permissions.HotelsUpdateAny)]
        public async Task<IActionResult> UpdateHotel(int hotelId, UpdateHotelRequest req)
        {
            var result = await managementService.UpdateHotelAsync(hotelId, req);
            return Ok(result);
        }

        [HttpPatch("hotels/{hotelId:int}/deactivate")]
        [Authorize(Policy = Permissions.HotelsDeactivateAny)]
        public async Task<IActionResult> DeactivateHotel(int hotelId)
        {
            await managementService.DeactivateHotelAsync(hotelId);
            return NoContent();
        }

        [HttpPatch("hotels/{hotelId:int}/owner")]
        [Authorize(Policy = Permissions.HotelsAssignOwner)]
        public async Task<IActionResult> AssignHotelOwner(int hotelId, AssignHotelOwnerRequest req)
        {
            var result = await managementService.AssignHotelOwnerAsync(hotelId, req.OwnerId);
            return Ok(result);
        }

        [HttpPatch("room-types/{roomTypeId:int}")]
        [Authorize(Policy = Permissions.RoomTypesUpdateAny)]
        public async Task<IActionResult> UpdateRoomType(int roomTypeId, UpdateRoomTypeRequest req)
        {
            var result = await managementService.UpdateRoomTypeAsync(roomTypeId, req);
            return Ok(result);
        }

        [HttpPatch("room-types/{roomTypeId:int}/deactivate")]
        [Authorize(Policy = Permissions.RoomTypesDeactivateAny)]
        public async Task<IActionResult> DeactivateRoomType(int roomTypeId)
        {
            await managementService.DeactivateRoomTypeAsync(roomTypeId);
            return NoContent();
        }

        [HttpPost("room-types/{roomTypeId:int}/rooms")]
        [Authorize(Policy = Permissions.RoomsCreateAny)]
        public async Task<IActionResult> CreateRoom(int roomTypeId, CreateRoomRequest req)
        {
            var result = await managementService.CreateRoomAsync(roomTypeId, req);
            return Ok(result);
        }

        [HttpPatch("rooms/{roomId:int}")]
        [Authorize(Policy = Permissions.RoomsUpdateAny)]
        public async Task<IActionResult> UpdateRoom(int roomId, UpdateRoomRequest req)
        {
            var result = await managementService.UpdateRoomAsync(roomId, req);
            return Ok(result);
        }

        [HttpPatch("rooms/{roomId:int}/deactivate")]
        [Authorize(Policy = Permissions.RoomsDeactivateAny)]
        public async Task<IActionResult> DeactivateRoom(int roomId)
        {
            await managementService.DeactivateRoomAsync(roomId);
            return NoContent();
        }

        [HttpGet("bookings")]
        [Authorize(Policy = Permissions.BookingsReadAny)]
        public async Task<IActionResult> GetBookings()
        {
            var result = await adminService.GetBookingsAsync();
            return Ok(result);
        }

        [HttpPatch("bookings/{bookingId:int}/cancel")]
        [Authorize(Policy = Permissions.BookingsCancelAny)]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            await adminService.CancelBookingAsync(bookingId);
            return NoContent();
        }

        [HttpPost("users/{userId:int}/bookings")]
        [Authorize(Policy = Permissions.BookingsCreateForUser)]
        public async Task<IActionResult> CreateBookingForUser(int userId, CreateBookingRequest req)
        {
            var result = await adminService.CreateBookingForUserAsync(userId, req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("users/{userId:int}/role")]
        [Authorize(Policy = Permissions.UsersManageRoles)]
        public async Task<IActionResult> UpdateUserRole(int userId, UpdateUserRoleRequest req)
        {
            var currentAdminId = User.GetUserId();
            var result = await adminService.UpdateUserRoleAsync(currentAdminId, userId, req);
            return Ok(result);
        }
    }
}
