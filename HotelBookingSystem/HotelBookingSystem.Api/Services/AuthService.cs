using HotelBookingSystem.Api.Contracts.Auth;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HotelBookingSystem.Api.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly JwtTokenService _jwtTokenService;

        public AuthService(AppDbContext context, IPasswordHasher<User> passwordHasher, JwtTokenService jwtTokenService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
        {
            var email = req.Email.Trim().ToLowerInvariant();
            var name = req.Name.Trim();
            var password = req.Password;

            var exists = await _context.Users.AnyAsync(u => u.Email == email);
            if (exists)
                throw new ConflictException("Email already in use.");

            var user = new User
            {
                Name = name,
                Email = email,
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
                throw new ConflictException("Email already in use.");
            }

            var token = _jwtTokenService.CreateToken(user);

            return new AuthResponse
            {
                Token = token,
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest req)
        {
            var email = req.Email.Trim().ToLowerInvariant();
            var password = req.Password;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email)
                ?? throw new UnauthorizedException("Invalid email or password.");

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);

            if (result == PasswordVerificationResult.Failed)
                throw new UnauthorizedException("Invalid email or password.");

            var token = _jwtTokenService.CreateToken(user);

            return new AuthResponse
            {
                Token = token,
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email
            };
        }

        private static bool IsUniqueEmailViolation(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException pgEx &&
                   pgEx.SqlState == PostgresErrorCodes.UniqueViolation &&
                   pgEx.ConstraintName == "IX_Users_Email";
        }
    }
}
