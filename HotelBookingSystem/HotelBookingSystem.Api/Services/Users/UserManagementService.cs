using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HotelBookingSystem.Api.Services.Users
{
    public class UserManagementService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserManagementService(AppDbContext context, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<List<UserRoleResponse>> GetUsersAsync()
        {
            return await _context.Users
                .AsNoTracking()
                .OrderBy(u => u.Id)
                .Select(u => new UserRoleResponse
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role,
                    PhoneNumber = u.PhoneNumber,
                    Country = u.Country
                })
                .ToListAsync();
        }

        public async Task<UserRoleResponse> CreateUserAsync(CreateUserRequest req)
        {
            if (!Enum.IsDefined(req.Role))
                throw new ValidationException("Недопустимая роль.");

            var email = req.Email.Trim().ToLowerInvariant();
            var exists = await _context.Users.AnyAsync(u => u.Email == email);
            if (exists)
                throw new ConflictException("Этот email уже используется.");

            var user = new User
            {
                Name = req.Name.Trim(),
                Email = email,
                Role = req.Role,
                PasswordHash = string.Empty,
                Settings = new UserSettings()
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, req.Password);
            _context.Users.Add(user);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (IsUniqueEmailViolation(ex))
            {
                throw new ConflictException("Этот email уже используется.");
            }

            return ToUserRoleResponse(user);
        }

        public async Task<UserRoleResponse> UpdateUserRoleAsync(int currentAdminId, int userId, UpdateUserRoleRequest req)
        {
            if (!Enum.IsDefined(req.Role))
                throw new ValidationException("Недопустимая роль.");

            if (currentAdminId == userId)
                throw new ValidationException("Администратор не может изменить собственную роль.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("Пользователь не найден.");

            if (user.Role == Role.Owner && req.Role != Role.Owner)
            {
                var ownsHotels = await _context.Hotels.AnyAsync(h => h.OwnerId == user.Id);
                if (ownsHotels)
                    throw new ValidationException("Нельзя изменить роль, пока пользователь назначен на один или несколько отелей.");
            }

            if (user.Role == Role.Admin && req.Role != Role.Admin)
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == Role.Admin);
                if (adminCount <= 1)
                    throw new ValidationException("Нельзя удалить последнего администратора.");
            }

            if (user.Role != req.Role)
            {
                user.Role = req.Role;

                var activeRefreshTokens = await _context.RefreshTokens
                    .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
                    .ToListAsync();

                foreach (var token in activeRefreshTokens)
                {
                    token.RevokedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return ToUserRoleResponse(user);
        }

        private static UserRoleResponse ToUserRoleResponse(User user) => new()
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber,
            Country = user.Country
        };

        private static bool IsUniqueEmailViolation(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException pgEx &&
                   pgEx.SqlState == PostgresErrorCodes.UniqueViolation &&
                   pgEx.ConstraintName == "IX_Users_Email";
        }
    }
}
