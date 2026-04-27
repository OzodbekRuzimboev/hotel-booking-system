using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services.Users
{
    public class UserManagementService
    {
        private readonly AppDbContext _context;

        public UserManagementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserRoleResponse> UpdateUserRoleAsync(int currentAdminId, int userId, UpdateUserRoleRequest req)
        {
            if (!Enum.IsDefined(req.Role))
                throw new ValidationException("Invalid role.");

            if (currentAdminId == userId)
                throw new ValidationException("Admin cannot change own role.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("User not found.");

            if (user.Role == Role.Owner && req.Role != Role.Owner)
            {
                var ownsHotels = await _context.Hotels.AnyAsync(h => h.OwnerId == user.Id);
                if (ownsHotels)
                    throw new ValidationException("Cannot change role while user is assigned to one or more hotels.");
            }

            if (user.Role == Role.Admin && req.Role != Role.Admin)
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == Role.Admin);
                if (adminCount <= 1)
                    throw new ValidationException("Cannot remove the last admin.");
            }

            user.Role = req.Role;
            await _context.SaveChangesAsync();

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
