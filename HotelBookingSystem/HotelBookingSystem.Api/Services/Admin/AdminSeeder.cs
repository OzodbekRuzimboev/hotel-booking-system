using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services.Admin
{
    public static class AdminSeeder
    {
        public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
        {
            using var scope = services.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

            var email = configuration["Admin:Email"];
            var password = configuration["Admin:Password"];

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return;

            var exists = await context.Users.AnyAsync(u => u.Email == email);

            if (exists)
                return;

            var admin = new User
            {
                Name = "Admin",
                Email = email,
                Role = Role.Admin,
                PasswordHash = string.Empty
            };

            admin.PasswordHash = passwordHasher.HashPassword(admin, password);

            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }
    }
}
