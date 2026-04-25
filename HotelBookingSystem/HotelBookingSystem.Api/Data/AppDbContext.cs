using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
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
        public DbSet<RoomType> RoomTypes => Set<RoomType>();
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Hotel>().HasMany(h => h.RoomTypes).WithOne(r => r.Hotel).HasForeignKey(r => r.HotelId);

            modelBuilder.Entity<RoomType>().HasMany(rt => rt.Rooms).WithOne(r => r.RoomType).HasForeignKey(r => r.RoomTypeId);

            modelBuilder.Entity<User>().HasMany(u => u.Bookings).WithOne(b => b.User).HasForeignKey(b => b.UserId);

            modelBuilder.Entity<Room>().HasMany(r => r.Bookings).WithOne(b => b.Room).HasForeignKey(b => b.RoomId);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<Room>().HasIndex(r => new { r.RoomTypeId, r.Number }).IsUnique();

            modelBuilder.Entity<Booking>().Property(b => b.Status).HasConversion<int>().HasDefaultValue(BookingStatus.Active);

            modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>().HasMaxLength(32);

            modelBuilder.Entity<Hotel>().HasOne(h => h.Owner).WithMany().HasForeignKey(h => h.OwnerId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
