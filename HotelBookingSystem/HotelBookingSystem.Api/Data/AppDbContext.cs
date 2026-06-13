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
        public DbSet<FavoriteHotel> FavoriteHotels => Set<FavoriteHotel>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<PopularDestination> PopularDestinations => Set<PopularDestination>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());

            modelBuilder.Entity<Hotel>().HasMany(h => h.RoomTypes).WithOne(r => r.Hotel).HasForeignKey(r => r.HotelId);

            modelBuilder.Entity<RoomType>().HasMany(rt => rt.Rooms).WithOne(r => r.RoomType).HasForeignKey(r => r.RoomTypeId);

            modelBuilder.Entity<Hotel>().HasMany<Room>().WithOne(r => r.Hotel).HasForeignKey(r => r.HotelId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>().HasMany(u => u.Bookings).WithOne(b => b.User).HasForeignKey(b => b.UserId);

            modelBuilder.Entity<User>().HasMany(u => u.FavoriteHotels).WithOne(f => f.User).HasForeignKey(f => f.UserId);

            modelBuilder.Entity<Hotel>().HasMany(h => h.Favorites).WithOne(f => f.Hotel).HasForeignKey(f => f.HotelId);

            modelBuilder.Entity<User>().HasMany(u => u.Reviews).WithOne(r => r.User).HasForeignKey(r => r.UserId);

            modelBuilder.Entity<Hotel>().HasMany(h => h.Reviews).WithOne(r => r.Hotel).HasForeignKey(r => r.HotelId);

            modelBuilder.Entity<RoomType>().HasMany(rt => rt.Reviews).WithOne(r => r.RoomType).HasForeignKey(r => r.RoomTypeId);

            modelBuilder.Entity<Room>().HasMany(r => r.Bookings).WithOne(b => b.Room).HasForeignKey(b => b.RoomId);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<Room>().HasIndex(r => new { r.HotelId, r.Number }).IsUnique();

            modelBuilder.Entity<FavoriteHotel>().HasIndex(f => new { f.UserId, f.HotelId }).IsUnique();

            modelBuilder.Entity<Review>().HasIndex(r => new { r.UserId, r.RoomTypeId }).IsUnique();

            modelBuilder.Entity<Booking>().Property(b => b.Status).HasConversion<int>().HasDefaultValue(BookingStatus.Active);

            modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>().HasMaxLength(32);

            modelBuilder.Entity<Hotel>().Property(h => h.IsActive).HasDefaultValue(true);

            modelBuilder.Entity<Hotel>().Property(h => h.ImageUrls).HasColumnType("text[]").HasDefaultValueSql("ARRAY[]::text[]");

            modelBuilder.Entity<Hotel>().Property(h => h.Amenities).HasColumnType("text[]").HasDefaultValueSql("ARRAY[]::text[]");

            modelBuilder.Entity<RoomType>().Property(rt => rt.IsActive).HasDefaultValue(true);

            modelBuilder.Entity<RoomType>().Property(rt => rt.ImageUrls).HasColumnType("text[]").HasDefaultValueSql("ARRAY[]::text[]");

            modelBuilder.Entity<RoomType>().Property(rt => rt.Amenities).HasColumnType("text[]").HasDefaultValueSql("ARRAY[]::text[]");

            modelBuilder.Entity<RoomType>().Property(rt => rt.MealOptions).HasColumnType("text[]").HasDefaultValueSql("ARRAY[]::text[]");

            modelBuilder.Entity<Room>().Property(r => r.IsActive).HasDefaultValue(true);

            modelBuilder.Entity<Hotel>().HasOne(h => h.Owner).WithMany().HasForeignKey(h => h.OwnerId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>().HasOne(r => r.Hotel).WithMany(h => h.Reviews).HasForeignKey(r => r.HotelId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>().HasOne(r => r.RoomType).WithMany(rt => rt.Reviews).HasForeignKey(r => r.RoomTypeId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PopularDestination>().Property(d => d.City).HasMaxLength(100);

            modelBuilder.Entity<PopularDestination>().Property(d => d.Country).HasMaxLength(100);

            modelBuilder.Entity<PopularDestination>().Property(d => d.ImageUrl).HasMaxLength(2000);

            modelBuilder.Entity<PopularDestination>().Property(d => d.IsActive).HasDefaultValue(true);

            modelBuilder.Entity<PopularDestination>().HasIndex(d => d.SortOrder);
        }
    }
}
