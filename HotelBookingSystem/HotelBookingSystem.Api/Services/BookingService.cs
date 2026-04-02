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
                TotalPrice = (req.CheckOutDate.DayNumber - req.CheckInDate.DayNumber) * room.Price,
                Status = BookingStatus.Active
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
            var today = DateOnly.FromDateTime(DateTime.Today);

            var bookings = await _context.Bookings.AsNoTracking().Where(b => b.UserId == userId)
                .Select(b => new BookingResponse
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    RoomId = b.RoomId,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    Status = b.Status == BookingStatus.Cancelled
                        ? BookingDisplayStatus.Cancelled
                        : b.CheckOutDate <= today
                            ? BookingDisplayStatus.Completed
                            : BookingDisplayStatus.Active
                }).ToListAsync();

            return bookings;
        }

        public async Task CancelBookingAsync(int userId, int bookingId)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId)
                ?? throw new NotFoundException("Booking not found.");

            var today = DateOnly.FromDateTime(DateTime.Today);

            if (booking.Status == BookingStatus.Cancelled)
                throw new ValidationException("Booking is already cancelled.");

            if (today >= booking.CheckInDate)
                throw new ValidationException("Booking can be cancelled only before check-in.");

            booking.Status = BookingStatus.Cancelled;

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
