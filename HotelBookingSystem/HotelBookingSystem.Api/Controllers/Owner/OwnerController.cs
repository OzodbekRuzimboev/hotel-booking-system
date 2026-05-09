using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Extensions;
using HotelBookingSystem.Api.Services.Bookings;
using HotelBookingSystem.Api.Services.Hotels;
using HotelBookingSystem.Api.Services.Rooms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers.Owner
{
    [ApiController]
    [Route("api/owner")]
    [Authorize]
    public class OwnerController : ControllerBase
    {
        private readonly HotelManagementService _hotelService;
        private readonly RoomTypeManagementService _roomTypeService;
        private readonly RoomManagementService _roomService;
        private readonly BookingService _bookingService;

        public OwnerController(
            HotelManagementService hotelService,
            RoomTypeManagementService roomTypeService,
            RoomManagementService roomService,
            BookingService bookingService)
        {
            _hotelService = hotelService;
            _roomTypeService = roomTypeService;
            _roomService = roomService;
            _bookingService = bookingService;
        }

        [HttpGet("hotels")]
        [Authorize(Policy = Permissions.HotelsUpdateOwn)]
        public async Task<IActionResult> GetMyHotels()
        {
            var ownerId = User.GetUserId();
            var result = await _hotelService.GetOwnerHotelsAsync(ownerId);

            return Ok(result);
        }


        [HttpPost("hotels")]
        [Authorize(Policy = Permissions.HotelsCreateOwn)]
        public async Task<IActionResult> CreateHotel(CreateHotelRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await _hotelService.CreateOwnerHotelAsync(ownerId, req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("hotels/{hotelId:int}")]
        [Authorize(Policy = Permissions.HotelsUpdateOwn)]
        public async Task<IActionResult> UpdateHotel(int hotelId, UpdateHotelRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await _hotelService.UpdateOwnerHotelAsync(ownerId, hotelId, req);

            return Ok(result);
        }

        [HttpPost("hotels/{hotelId:int}/room-types")]
        [Authorize(Policy = Permissions.RoomTypesCreateOwn)]
        public async Task<IActionResult> CreateRoomType(int hotelId, RoomTypeRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await _roomTypeService.CreateOwnerRoomTypeAsync(ownerId, hotelId, req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("room-types/{roomTypeId:int}")]
        [Authorize(Policy = Permissions.RoomTypesUpdateOwn)]
        public async Task<IActionResult> UpdateRoomType(int roomTypeId, UpdateRoomTypeRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await _roomTypeService.UpdateOwnerRoomTypeAsync(ownerId, roomTypeId, req);

            return Ok(result);
        }

        [HttpPatch("room-types/{roomTypeId:int}/deactivate")]
        [Authorize(Policy = Permissions.RoomTypesDeactivateOwn)]
        public async Task<IActionResult> DeactivateRoomType(int roomTypeId)
        {
            var ownerId = User.GetUserId();
            await _roomTypeService.DeactivateOwnerRoomTypeAsync(ownerId, roomTypeId);

            return NoContent();
        }

        [HttpPost("room-types/{roomTypeId:int}/rooms")]
        [Authorize(Policy = Permissions.RoomsCreateOwn)]
        public async Task<IActionResult> CreateRoom(int roomTypeId, CreateRoomRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await _roomService.CreateOwnerRoomAsync(ownerId, roomTypeId, req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("rooms/{roomId:int}")]
        [Authorize(Policy = Permissions.RoomsUpdateOwn)]
        public async Task<IActionResult> UpdateRoom(int roomId, UpdateRoomRequest req)
        {
            var ownerId = User.GetUserId();
            var result = await _roomService.UpdateOwnerRoomAsync(ownerId, roomId, req);

            return Ok(result);
        }

        [HttpPatch("rooms/{roomId:int}/deactivate")]
        [Authorize(Policy = Permissions.RoomsDeactivateOwn)]
        public async Task<IActionResult> DeactivateRoom(int roomId)
        {
            var ownerId = User.GetUserId();
            await _roomService.DeactivateOwnerRoomAsync(ownerId, roomId);

            return NoContent();
        }

        [HttpGet("bookings")]
        [Authorize(Policy = Permissions.BookingsReadOwnHotel)]
        public async Task<IActionResult> GetBookings(int hotelId)
        {
            var ownerId = User.GetUserId();
            var result = await _bookingService.GetOwnerHotelBookingsAsync(hotelId, ownerId);

            return Ok(result);
        }

        [HttpPatch("bookings/{bookingId:int}/cancel")]
        [Authorize(Policy = Permissions.BookingsCancelOwnHotel)]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            var ownerId = User.GetUserId();
            await _bookingService.CancelOwnerHotelBookingAsync(bookingId, ownerId);

            return NoContent();
        }
    }
}
