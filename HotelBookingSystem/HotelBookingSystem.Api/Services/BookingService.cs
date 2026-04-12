using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HotelBookingSystem.Api.Services
{
    public class BookingService
    {
        private readonly AppDbContext _context;

        public BookingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BookingResponse> CreateBookingAsync(int userId, CreateBookingRequest req)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);

            if (!userExists) 
                throw new NotFoundException("User not found.");

            if (req.CheckInDate >= req.CheckOutDate)
                throw new ValidationException("Check-in date must be earlier than check-out date.");

            var today = DateOnly.FromDateTime(DateTime.Today);

            if (req.CheckInDate < today)
                throw new ValidationException("Check-in date cannot be earlier than today.");

            var roomType = await _context.RoomTypes
                .AsNoTracking()
                .Where(rt => rt.Id == req.RoomTypeId)
                .Select(rt => new
                {
                    rt.Id,
                    rt.Price
                })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Room type not found");

            var room = await _context.Rooms
                .Where(r => r.RoomTypeId == req.RoomTypeId)
                .Where(r => !r.Bookings.Any(b =>
                    b.Status == BookingStatus.Active &&
                    b.CheckInDate < req.CheckOutDate &&
                    b.CheckOutDate > req.CheckInDate))
                .Select(r => new
                {
                    r.Id
                })
                .FirstOrDefaultAsync()
                ?? throw new ConflictException("No available rooms of this type for the selected dates.");

            var booking = new Booking
            {
                UserId = userId,
                RoomId = room.Id,
                CheckInDate = req.CheckInDate,
                CheckOutDate = req.CheckOutDate,
                TotalPrice = (req.CheckOutDate.DayNumber - req.CheckInDate.DayNumber) * roomType.Price,
                Status = BookingStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (IsOverlappingBookingConstraint(ex))
            {
                throw new ConflictException("No available rooms of this type for the selected dates.");
            }

            var bookingResponse = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.Id == booking.Id)
                .Select(b => new BookingResponse
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    RoomId = b.RoomId,
                    HotelName = b.Room.RoomType.Hotel.Name,
                    RoomTypeName = b.Room.RoomType.Name,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    TotalPrice = b.TotalPrice,
                    Status = BookingDisplayStatus.Active,
                    CreatedAt = b.CreatedAt,
                    CancelledAt = b.CancelledAt
                })
                .FirstAsync();

            return bookingResponse;
        }

        public async Task<List<BookingResponse>> GetBookingsAsync(int userId)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);

            var bookings = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.UserId == userId)
                .Select(b => new BookingResponse
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    RoomId = b.RoomId,
                    HotelName = b.Room.RoomType.Hotel.Name,
                    RoomTypeName = b.Room.RoomType.Name,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    TotalPrice = b.TotalPrice,
                    Status = b.Status == BookingStatus.Cancelled
                        ? BookingDisplayStatus.Cancelled
                        : b.CheckOutDate <= today
                            ? BookingDisplayStatus.Completed
                            : BookingDisplayStatus.Active,
                    CreatedAt = b.CreatedAt,
                    CancelledAt = b.CancelledAt
                })
                .ToListAsync();

            return bookings;
        }

        public async Task CancelBookingAsync(int userId, int bookingId)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId)
                ?? throw new NotFoundException("Booking not found.");

            var today = DateOnly.FromDateTime(DateTime.Today);

            if (booking.Status == BookingStatus.Cancelled)
                throw new ValidationException("Booking is already cancelled.");

            if (today >= booking.CheckInDate)
                throw new ValidationException("Booking can be cancelled only before check-in.");

            booking.Status = BookingStatus.Cancelled;
            booking.CancelledAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        private static bool IsOverlappingBookingConstraint(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException pg &&
                   pg.SqlState == PostgresErrorCodes.ExclusionViolation &&
                   pg.ConstraintName == "EX_Bookings_RoomId_DateRange_NoOverlap";
        }
    }
}
