using HotelBookingSystem.Api.Contracts.Auth;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using HotelBookingSystem.Api.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Security;

namespace HotelBookingSystem.Api.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly TokenService _tokenService;

        public AuthService(AppDbContext context, IPasswordHasher<User> passwordHasher, TokenService tokenService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
        {
            var email = req.Email.Trim().ToLowerInvariant();
            var name = req.Name.Trim();
            var password = req.Password;
            var role = req.Role ?? Role.User;

            if (role is not Role.User and not Role.Owner)
                throw new ValidationException("Публично можно зарегистрировать только аккаунт гостя или владельца.");

            var exists = await _context.Users.AnyAsync(u => u.Email == email);
            if (exists)
                throw new ConflictException("Этот email уже используется.");

            var user = new User
            {
                Name = name,
                Email = email,
                Role = role,
                PasswordHash = string.Empty
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, password);

            _context.Users.Add(user);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (IsUniqueEmailViolation(ex))
            {
                throw new ConflictException("Этот email уже используется.");
            }

            var accessToken = _tokenService.CreateToken(user);

            var refreshToken = _tokenService.GenerateRefreshToken();

            var refreshTokenHash = _tokenService.HashToken(refreshToken);

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = refreshTokenHash,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            });
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest req)
        {
            var email = req.Email.Trim().ToLowerInvariant();
            var password = req.Password;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email)
                ?? throw new UnauthorizedException("Неверный email или пароль.");

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);

            if (result == PasswordVerificationResult.Failed)
                throw new UnauthorizedException("Неверный email или пароль.");

            var accessToken = _tokenService.CreateToken(user);

            var refreshToken = _tokenService.GenerateRefreshToken();

            var refreshTokenHash = _tokenService.HashToken(refreshToken);

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = refreshTokenHash,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            });
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        public async Task<AuthResponse> RefreshAsync(string refreshToken)
        {
            var refreshTokenHash = _tokenService.HashToken(refreshToken);
            var now = DateTime.UtcNow;

            var storedToken = await _context.RefreshTokens
                .AsNoTracking()
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash)
                ?? throw new UnauthorizedException("Недействительный токен обновления.");

            if (storedToken.RevokedAt is not null || storedToken.ExpiresAt <= now)
                throw new UnauthorizedException("Токен обновления больше не активен.");

            var user = storedToken.User;

            var newRefreshToken = _tokenService.GenerateRefreshToken();
            var newRefreshTokenHash = _tokenService.HashToken(newRefreshToken);

            await using var transaction = await _context.Database.BeginTransactionAsync();

            var revokedCount = await _context.RefreshTokens
                .Where(rt =>
                    rt.Id == storedToken.Id &&
                    rt.RevokedAt == null &&
                    rt.ExpiresAt > now)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(rt => rt.RevokedAt, now)
                    .SetProperty(rt => rt.ReplacedByTokenHash, newRefreshTokenHash));

            if (revokedCount != 1)
                throw new UnauthorizedException("Токен обновления больше не активен.");

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = newRefreshTokenHash,
                ExpiresAt = now.AddDays(7)
            });

            var newAccessToken = _tokenService.CreateToken(user);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new AuthResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        public async Task RevokeRefreshTokenAsync(string refreshToken)
        {
            var refreshTokenHash = _tokenService.HashToken(refreshToken);

            var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash)
                ?? throw new UnauthorizedException("Недействительный токен обновления.");

            if (storedToken.RevokedAt is null)
            {
                storedToken.RevokedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
            }
        }

        private static bool IsUniqueEmailViolation(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException pgEx &&
                   pgEx.SqlState == PostgresErrorCodes.UniqueViolation &&
                   pgEx.ConstraintName == "IX_Users_Email";
        }
    }
}
