using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Extensions;
using HotelBookingSystem.Api.Services.Bookings;
using HotelBookingSystem.Api.Services.Hotels;
using HotelBookingSystem.Api.Services.Rooms;
using HotelBookingSystem.Api.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingSystem.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly HotelManagementService _hotelService;
        private readonly RoomTypeManagementService _roomTypeService;
        private readonly RoomManagementService _roomService;
        private readonly BookingService _bookingService;
        private readonly UserManagementService _userService;

        public AdminController(
            HotelManagementService hotelService,
            RoomTypeManagementService roomTypeService,
            RoomManagementService roomService,
            BookingService bookingService,
            UserManagementService userService)
        {
            _hotelService = hotelService;
            _roomTypeService = roomTypeService;
            _roomService = roomService;
            _bookingService = bookingService;
            _userService = userService;
        }

        [HttpPost("hotels")]
        [Authorize(Policy = Permissions.HotelsCreate)]
        public async Task<IActionResult> CreateHotel(CreateHotelRequest req)
        {
            var hotel = await _hotelService.CreateHotelAsync(req);

            return StatusCode(StatusCodes.Status201Created, hotel);
        }

        [HttpPatch("hotels/{hotelId:int}")]
        [Authorize(Policy = Permissions.HotelsUpdateAny)]
        public async Task<IActionResult> UpdateHotel(int hotelId, UpdateHotelRequest req)
        {
            var result = await _hotelService.UpdateHotelAsync(hotelId, req);

            return Ok(result);
        }

        [HttpPatch("hotels/{hotelId:int}/deactivate")]
        [Authorize(Policy = Permissions.HotelsDeactivateAny)]
        public async Task<IActionResult> DeactivateHotel(int hotelId)
        {
            await _hotelService.DeactivateHotelAsync(hotelId);

            return NoContent();
        }

        [HttpPatch("hotels/{hotelId:int}/owner")]
        [Authorize(Policy = Permissions.HotelsAssignOwner)]
        public async Task<IActionResult> AssignHotelOwner(int hotelId, AssignHotelOwnerRequest req)
        {
            var result = await _hotelService.AssignHotelOwnerAsync(hotelId, req.OwnerId);

            return Ok(result);
        }


        [HttpPost("hotels/{hotelId:int}/room-types")]
        [Authorize(Policy = Permissions.RoomTypesCreateAny)]
        public async Task<IActionResult> CreateRoomType(int hotelId, RoomTypeRequest req)
        {
            var result = await _roomTypeService.CreateRoomTypeAsync(hotelId, req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("room-types/{roomTypeId:int}")]
        [Authorize(Policy = Permissions.RoomTypesUpdateAny)]
        public async Task<IActionResult> UpdateRoomType(int roomTypeId, UpdateRoomTypeRequest req)
        {
            var result = await _roomTypeService.UpdateRoomTypeAsync(roomTypeId, req);

            return Ok(result);
        }

        [HttpPatch("room-types/{roomTypeId:int}/deactivate")]
        [Authorize(Policy = Permissions.RoomTypesDeactivateAny)]
        public async Task<IActionResult> DeactivateRoomType(int roomTypeId)
        {
            await _roomTypeService.DeactivateRoomTypeAsync(roomTypeId);

            return NoContent();
        }

        [HttpPost("room-types/{roomTypeId:int}/rooms")]
        [Authorize(Policy = Permissions.RoomsCreateAny)]
        public async Task<IActionResult> CreateRoom(int roomTypeId, CreateRoomRequest req)
        {
            var result = await _roomService.CreateRoomAsync(roomTypeId, req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("rooms/{roomId:int}")]
        [Authorize(Policy = Permissions.RoomsUpdateAny)]
        public async Task<IActionResult> UpdateRoom(int roomId, UpdateRoomRequest req)
        {
            var result = await _roomService.UpdateRoomAsync(roomId, req);

            return Ok(result);
        }

        [HttpPatch("rooms/{roomId:int}/deactivate")]
        [Authorize(Policy = Permissions.RoomsDeactivateAny)]
        public async Task<IActionResult> DeactivateRoom(int roomId)
        {
            await _roomService.DeactivateRoomAsync(roomId);

            return NoContent();
        }

        [HttpGet("bookings")]
        [Authorize(Policy = Permissions.BookingsReadAny)]
        public async Task<IActionResult> GetBookings()
        {
            var result = await _bookingService.GetAllBookingsAsync();

            return Ok(result);
        }

        [HttpPatch("bookings/{bookingId:int}/cancel")]
        [Authorize(Policy = Permissions.BookingsCancelAny)]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            await _bookingService.CancelAnyBookingAsync(bookingId);

            return NoContent();
        }

        [HttpPost("users/{userId:int}/bookings")]
        [Authorize(Policy = Permissions.BookingsCreateForUser)]
        public async Task<IActionResult> CreateBookingForUser(int userId, CreateBookingRequest req)
        {
            var result = await _bookingService.CreateBookingForUserAsync(userId, req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpGet("users")]
        [Authorize(Policy = Permissions.UsersManageRoles)]
        public async Task<IActionResult> GetUsers()
        {
            var result = await _userService.GetUsersAsync();

            return Ok(result);
        }

        [HttpPost("users")]
        [Authorize(Policy = Permissions.UsersManageRoles)]
        public async Task<IActionResult> CreateUser(CreateUserRequest req)
        {
            var result = await _userService.CreateUserAsync(req);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("users/{userId:int}/role")]
        [Authorize(Policy = Permissions.UsersManageRoles)]
        public async Task<IActionResult> UpdateUserRole(int userId, UpdateUserRoleRequest req)
        {
            var currentAdminId = User.GetUserId();
            var result = await _userService.UpdateUserRoleAsync(currentAdminId, userId, req);

            return Ok(result);
        }
    }
}
