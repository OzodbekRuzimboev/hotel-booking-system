using HotelBookingSystem.Api.Contracts;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services
{
    public class BookingService
    {
        private readonly AppDbContext _context;

        public BookingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Booking> CreateBookingAsync(CreateBookingRequest req)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == req.UserId);

            if (!userExists) 
                throw new NotFoundException("User not found.");

            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == req.RoomId) 
                ?? throw new NotFoundException("Room not found.");

            if (req.CheckInDate >= req.CheckOutDate)
                throw new ValidationException("Check-in date must be earlier than check-out date.");

            var isTaken = await _context.Bookings.AnyAsync(b => b.RoomId == req.RoomId &&
                                                req.CheckInDate < b.CheckOutDate &&
                                                req.CheckOutDate > b.CheckInDate);
            if (isTaken)
                throw new ConflictException("Room is already booked for the selected dates.");

            var booking = new Booking
            {
                UserId = req.UserId,
                RoomId = req.RoomId,
                CheckInDate = req.CheckInDate,
                CheckOutDate = req.CheckOutDate,
                TotalPrice = (req.CheckOutDate.DayNumber - req.CheckInDate.DayNumber) * room.Price
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return booking;
        }

        public async Task<List<BookingResponse>> GetBookingsAsync(int userId)
        {
            var bookings = await _context.Bookings.AsNoTracking().Where(b => b.UserId == userId).Select(b => new BookingResponse
            {
                Id = b.Id,
                UserId = b.UserId,
                RoomId = b.RoomId,
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate
            }).ToListAsync();

            return bookings;
        }
    }
}
