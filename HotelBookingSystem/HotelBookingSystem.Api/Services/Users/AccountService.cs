using HotelBookingSystem.Api.Contracts.Account;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services.Users
{
    public class AccountService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AccountService(AppDbContext context, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserAccountResponse> GetAccountAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("User not found.");

            return ToAccountResponse(user);
        }

        public async Task<UserAccountResponse> UpdateProfileAsync(int userId, UpdateProfileRequest req)
        {
            var user = await _context.Users
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("User not found.");

            user.Name = req.Name.Trim();
            user.PhoneNumber = NormalizeOptionalText(req.PhoneNumber);
            user.Country = NormalizeOptionalText(req.Country);
            user.ProfileImageUrl = NormalizeOptionalText(req.ProfileImageUrl);

            await EnsureSettingsAsync(user);
            await _context.SaveChangesAsync();

            return ToAccountResponse(user);
        }

        public async Task<AccountSettingsResponse> UpdateSettingsAsync(int userId, AccountSettingsRequest req)
        {
            var user = await _context.Users
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("User not found.");

            await EnsureSettingsAsync(user);

            user.Settings!.PreferredCurrency = req.PreferredCurrency.Trim().ToUpperInvariant();
            user.Settings.PreferredLanguage = req.PreferredLanguage.Trim().ToLowerInvariant();
            user.Settings.EmailNotificationsEnabled = req.EmailNotificationsEnabled;

            await _context.SaveChangesAsync();

            return ToSettingsResponse(user.Settings);
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordRequest req)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("User not found.");

            var currentPasswordResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                req.CurrentPassword);

            if (currentPasswordResult == PasswordVerificationResult.Failed)
                throw new ValidationException("Current password is incorrect.");

            var newPasswordResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                req.NewPassword);

            if (newPasswordResult != PasswordVerificationResult.Failed)
                throw new ValidationException("New password must be different from current password.");

            user.PasswordHash = _passwordHasher.HashPassword(user, req.NewPassword);

            await _context.SaveChangesAsync();
        }

        public async Task<List<FavoriteHotelResponse>> GetFavoritesAsync(int userId)
        {
            return await _context.FavoriteHotels
                .AsNoTracking()
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FavoriteHotelResponse
                {
                    HotelId = f.HotelId,
                    Name = f.Hotel.Name,
                    Description = f.Hotel.Description,
                    ImageUrl = f.Hotel.ImageUrl,
                    City = f.Hotel.City,
                    Address = f.Hotel.Address,
                    AverageRating = f.Hotel.Reviews.Any() ? f.Hotel.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = f.Hotel.Reviews.Count,
                    AddedAt = f.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> IsFavoriteAsync(int userId, int hotelId)
        {
            return await _context.FavoriteHotels.AnyAsync(f => f.UserId == userId && f.HotelId == hotelId);
        }

        public async Task AddFavoriteAsync(int userId, int hotelId)
        {
            var hotelExists = await _context.Hotels.AnyAsync(h => h.Id == hotelId && h.IsActive);
            if (!hotelExists)
                throw new NotFoundException("Hotel not found.");

            var exists = await IsFavoriteAsync(userId, hotelId);
            if (exists)
                return;

            _context.FavoriteHotels.Add(new FavoriteHotel
            {
                UserId = userId,
                HotelId = hotelId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        public async Task RemoveFavoriteAsync(int userId, int hotelId)
        {
            var favorite = await _context.FavoriteHotels
                .FirstOrDefaultAsync(f => f.UserId == userId && f.HotelId == hotelId);

            if (favorite is null)
                return;

            _context.FavoriteHotels.Remove(favorite);
            await _context.SaveChangesAsync();
        }

        private async Task EnsureSettingsAsync(User user)
        {
            if (user.Settings is not null)
                return;

            user.Settings = new UserSettings { UserId = user.Id };
            _context.UserSettings.Add(user.Settings);
            await Task.CompletedTask;
        }

        private static UserAccountResponse ToAccountResponse(User user) => new()
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber,
            Country = user.Country,
            ProfileImageUrl = user.ProfileImageUrl,
            Settings = user.Settings is null
                ? new AccountSettingsResponse()
                : ToSettingsResponse(user.Settings)
        };

        private static AccountSettingsResponse ToSettingsResponse(UserSettings settings) => new()
        {
            PreferredCurrency = settings.PreferredCurrency,
            PreferredLanguage = settings.PreferredLanguage,
            EmailNotificationsEnabled = settings.EmailNotificationsEnabled
        };

        private static string? NormalizeOptionalText(string? value)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
        }
    }
}
