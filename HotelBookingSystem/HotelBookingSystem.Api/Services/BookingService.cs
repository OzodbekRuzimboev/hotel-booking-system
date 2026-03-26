using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HotelBookingSystem.Api.Services
{
    public class BookingService
    {
        private readonly AppDbContext _context;

        private const string NoOverlapConstraintName = "EX_Bookings_RoomId_DateRange_NoOverlap";

        public BookingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Booking> CreateBookingAsync(int userId, CreateBookingRequest req)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);

            if (!userExists) 
                throw new NotFoundException("User not found.");

            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == req.RoomId) 
                ?? throw new NotFoundException("Room not found.");

            if (req.CheckInDate >= req.CheckOutDate)
                throw new ValidationException("Check-in date must be earlier than check-out date.");

            var booking = new Booking
            {
                UserId = userId,
                RoomId = req.RoomId,
                CheckInDate = req.CheckInDate,
                CheckOutDate = req.CheckOutDate,
                TotalPrice = (req.CheckOutDate.DayNumber - req.CheckInDate.DayNumber) * room.Price
            };

            _context.Bookings.Add(booking);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (IsOverlappingBookingConstraint(ex))
            {
                throw new ConflictException("Room is already booked for the selected dates.");
            }


            return booking;
        }

        public async Task<List<BookingResponse>> GetBookingsAsync(int userId)
        {
            var bookings = await _context.Bookings.AsNoTracking().Where(b => b.UserId == userId)
                .Select(b => new BookingResponse
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    RoomId = b.RoomId,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate
                }).ToListAsync();

            return bookings;
        }

        private static bool IsOverlappingBookingConstraint(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException pg &&
                   pg.SqlState == PostgresErrorCodes.ExclusionViolation &&
                   pg.ConstraintName == NoOverlapConstraintName;
        }
    }
}
