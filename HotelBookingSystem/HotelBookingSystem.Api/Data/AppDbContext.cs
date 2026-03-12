using HotelBookingSystem.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Hotel> Hotels => Set<Hotel>();
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Hotel>().HasMany(h => h.Rooms).WithOne(r => r.Hotel).HasForeignKey(r => r.HotelId);

            modelBuilder.Entity<User>().HasMany(u => u.Bookings).WithOne(b => b.User).HasForeignKey(b => b.UserId);

            modelBuilder.Entity<Room>().HasMany(r => r.Bookings).WithOne(b => b.Room).HasForeignKey(b => b.RoomId);
        }
    }
}
