using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Contracts.Hotels;
using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HotelBookingSystem.Api.Services.Admin
{
    public class AdminService(AppDbContext context, BookingService bookingService)
    {
        public async Task<HotelDetailsResponse> CreateHotelAsync(CreateHotelRequest req)
        {
            var hotel = new Hotel
            {
                Name = req.Name,
                Description = req.Description,
                City = req.City,
                Address = req.Address,
                RoomTypes = req.RoomTypes.Select(rt => new RoomType
                {
                    Name = rt.Name,
                    Description = rt.Description,
                    Capacity = rt.Capacity,
                    Price = rt.Price,
                    Rooms = rt.Rooms.Select(r => new Room { Number = r.Number }).ToList()
                }).ToList()
            };

            context.Hotels.Add(hotel);

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueRoomNumberViolation(ex))
            {
                throw new ConflictException("Room number already exists in this room type.");
            }

            var hotelResponse = new HotelDetailsResponse
            {
                Id = hotel.Id,
                Name = hotel.Name,
                Description = hotel.Description,
                City = hotel.City,
                Address = hotel.Address,
                RoomTypes = hotel.RoomTypes.Select(rt => new RoomTypeResponse
                {
                    Id = rt.Id,
                    Name = rt.Name,
                    Description = rt.Description,
                    Capacity = rt.Capacity,
                    Price = rt.Price,
                    TotalCount = rt.Rooms.Count
                }).ToList()
            };

            return hotelResponse;
        }

        public async Task<List<BookingResponse>> GetBookingsAsync()
        {
            return await bookingService.GetAllBookingsAsync();
        }

        public async Task CancelBookingAsync(int bookingId)
        {
            await bookingService.CancelAnyBookingAsync(bookingId);
        }

        public async Task<BookingResponse> CreateBookingForUserAsync(int userId, CreateBookingRequest req)
        {
            var targetUser = await context.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new { u.Id, u.Role })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("User not found.");

            if (targetUser.Role != Role.User)
                throw new ValidationException("Booking can be created only for a regular user account.");

            return await bookingService.CreateBookingAsync(userId, req);
        }

        public async Task<UserRoleResponse> UpdateUserRoleAsync(int currentAdminId, int userId, UpdateUserRoleRequest req)
        {
            if (!Enum.IsDefined(req.Role))
                throw new ValidationException("Invalid role.");

            if (currentAdminId == userId)
                throw new ValidationException("Admin cannot change own role.");

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("User not found.");

            if (user.Role == Role.Owner && req.Role != Role.Owner)
            {
                var ownsHotels = await context.Hotels.AnyAsync(h => h.OwnerId == user.Id);
                if (ownsHotels)
                    throw new ValidationException("Cannot change role while user is assigned to one or more hotels.");
            }

            if (user.Role == Role.Admin && req.Role != Role.Admin)
            {
                var adminCount = await context.Users.CountAsync(u => u.Role == Role.Admin);
                if (adminCount <= 1)
                    throw new ValidationException("Cannot remove the last admin.");
            }

            user.Role = req.Role;
            await context.SaveChangesAsync();

            return new UserRoleResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}
