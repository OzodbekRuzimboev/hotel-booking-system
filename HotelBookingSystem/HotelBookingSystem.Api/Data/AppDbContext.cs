using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Users;
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
        public DbSet<UserSettings> UserSettings => Set<UserSettings>();
        public DbSet<FavoriteHotel> FavoriteHotels => Set<FavoriteHotel>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());

            modelBuilder.Entity<Hotel>().HasMany(h => h.RoomTypes).WithOne(r => r.Hotel).HasForeignKey(r => r.HotelId);

            modelBuilder.Entity<RoomType>().HasMany(rt => rt.Rooms).WithOne(r => r.RoomType).HasForeignKey(r => r.RoomTypeId);

            modelBuilder.Entity<User>().HasMany(u => u.Bookings).WithOne(b => b.User).HasForeignKey(b => b.UserId);

            modelBuilder.Entity<User>().HasOne(u => u.Settings).WithOne(s => s.User).HasForeignKey<UserSettings>(s => s.UserId);

            modelBuilder.Entity<User>().HasMany(u => u.FavoriteHotels).WithOne(f => f.User).HasForeignKey(f => f.UserId);

            modelBuilder.Entity<Hotel>().HasMany(h => h.Favorites).WithOne(f => f.Hotel).HasForeignKey(f => f.HotelId);

            modelBuilder.Entity<User>().HasMany(u => u.Reviews).WithOne(r => r.User).HasForeignKey(r => r.UserId);

            modelBuilder.Entity<Hotel>().HasMany(h => h.Reviews).WithOne(r => r.Hotel).HasForeignKey(r => r.HotelId);

            modelBuilder.Entity<RoomType>().HasMany(rt => rt.Reviews).WithOne(r => r.RoomType).HasForeignKey(r => r.RoomTypeId);

            modelBuilder.Entity<Room>().HasMany(r => r.Bookings).WithOne(b => b.Room).HasForeignKey(b => b.RoomId);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<Room>().HasIndex(r => new { r.RoomTypeId, r.Number }).IsUnique();

            modelBuilder.Entity<UserSettings>().HasIndex(s => s.UserId).IsUnique();

            modelBuilder.Entity<FavoriteHotel>().HasIndex(f => new { f.UserId, f.HotelId }).IsUnique();

            modelBuilder.Entity<Review>().HasIndex(r => new { r.UserId, r.RoomTypeId }).IsUnique();

            modelBuilder.Entity<Booking>().Property(b => b.Status).HasConversion<int>().HasDefaultValue(BookingStatus.Active);

            modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>().HasMaxLength(32);

            modelBuilder.Entity<UserSettings>().Property(s => s.PreferredCurrency).HasMaxLength(3).HasDefaultValue("USD");

            modelBuilder.Entity<UserSettings>().Property(s => s.PreferredLanguage).HasMaxLength(10).HasDefaultValue("en");

            modelBuilder.Entity<Hotel>().Property(h => h.IsActive).HasDefaultValue(true);

            modelBuilder.Entity<RoomType>().Property(rt => rt.IsActive).HasDefaultValue(true);

            modelBuilder.Entity<Room>().Property(r => r.IsActive).HasDefaultValue(true);

            modelBuilder.Entity<Hotel>().HasOne(h => h.Owner).WithMany().HasForeignKey(h => h.OwnerId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>().HasOne(r => r.Hotel).WithMany(h => h.Reviews).HasForeignKey(r => r.HotelId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>().HasOne(r => r.RoomType).WithMany(rt => rt.Reviews).HasForeignKey(r => r.RoomTypeId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
