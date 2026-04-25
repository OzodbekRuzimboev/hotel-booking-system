using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Extensions;
using HotelBookingSystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers.Owner
{
    [ApiController]
    [Route("api/owner")]
    [Authorize]
    public class OwnerController(ManagementService managementService, BookingService bookingService) : ControllerBase
    {
        [HttpGet("hotels")]
        [Authorize(Policy = Permissions.HotelsUpdateOwn)]
        public async Task<IActionResult> GetMyHotels()
        {
            var ownerId = User.GetUserId();
            var result = await managementService.GetOwnerHotelsAsync(ownerId);
            return Ok(result);
        }

        [HttpPatch("hotels/{hotelId:int}")]
        [Authorize(Policy = Permissions.HotelsUpdateOwn)]
        public async Task<IActionResult> UpdateHotel(int hotelId, UpdateHotelRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await managementService.UpdateOwnerHotelAsync(ownerId, hotelId, req);
            return Ok(result);
        }

        [HttpPost("hotels/{hotelId:int}/room-types")]
        [Authorize(Policy = Permissions.RoomTypesCreateOwn)]
        public async Task<IActionResult> CreateRoomType(int hotelId, RoomTypeRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await managementService.CreateOwnerRoomTypeAsync(ownerId, hotelId, req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("room-types/{roomTypeId:int}")]
        [Authorize(Policy = Permissions.RoomTypesUpdateOwn)]
        public async Task<IActionResult> UpdateRoomType(int roomTypeId, UpdateRoomTypeRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await managementService.UpdateOwnerRoomTypeAsync(ownerId, roomTypeId, req);
            return Ok(result);
        }

        [HttpPatch("room-types/{roomTypeId:int}/deactivate")]
        [Authorize(Policy = Permissions.RoomTypesDeactivateOwn)]
        public async Task<IActionResult> DeactivateRoomType(int roomTypeId)
        {
            var ownerId = User.GetUserId();
            await managementService.DeactivateOwnerRoomTypeAsync(ownerId, roomTypeId);
            return NoContent();
        }

        [HttpPost("room-types/{roomTypeId:int}/rooms")]
        [Authorize(Policy = Permissions.RoomsCreateOwn)]
        public async Task<IActionResult> CreateRoom(int roomTypeId, CreateRoomRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await managementService.CreateOwnerRoomAsync(ownerId, roomTypeId, req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("rooms/{roomId:int}")]
        [Authorize(Policy = Permissions.RoomsUpdateOwn)]
        public async Task<IActionResult> UpdateRoom(int roomId, UpdateRoomRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await managementService.UpdateOwnerRoomAsync(ownerId, roomId, req);
            return Ok(result);
        }

        [HttpPatch("rooms/{roomId:int}/deactivate")]
        [Authorize(Policy = Permissions.RoomsDeactivateOwn)]
        public async Task<IActionResult> DeactivateRoom(int roomId)
        {
            var ownerId = User.GetUserId();
            await managementService.DeactivateOwnerRoomAsync(ownerId, roomId);
            return NoContent();
        }

        [HttpGet("bookings")]
        [Authorize(Policy = Permissions.BookingsReadOwnHotels)]
        public async Task<IActionResult> GetBookings()
        {
            var ownerId = User.GetUserId();
            var result = await bookingService.GetBookingsForOwnerHotelsAsync(ownerId);
            return Ok(result);
        }

        [HttpPatch("bookings/{bookingId:int}/cancel")]
        [Authorize(Policy = Permissions.BookingsCancelOwnHotels)]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            var ownerId = User.GetUserId();
            await bookingService.CancelOwnerHotelBookingAsync(ownerId, bookingId);
            return NoContent();
        }
    }
}
