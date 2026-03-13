using HotelBookingSystem.Api.Contracts;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Exceptions;

namespace HotelBookingSystem.Api.Services
{
    public class BookingService
    {
        private readonly AppDbContext _context;

        public BookingService(AppDbContext context)
        {
            _context = context;
        }

        public Booking CreateBooking(CreateBookingRequest req)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == req.UserId) ?? throw new NotFoundException("User not found.");
            var room = _context.Rooms.FirstOrDefault(r => r.Id == req.RoomId) ?? throw new NotFoundException("Room not found.");

            if (req.CheckInDate >= req.CheckOutDate)
                throw new ValidationException("Check-in date must be earlier than check-out date.");

            var isTaken = _context.Bookings.Any(b => b.RoomId == req.RoomId &&
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
            _context.SaveChanges();

            return booking;
        }

        public List<BookingResponse> GetBookings(int userId)
        {
            var bookings = _context.Bookings.Where(b => b.UserId == userId).Select(b => new BookingResponse
            {
                Id = b.Id,
                UserId = b.UserId,
                RoomId = b.RoomId,
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate
            }).ToList();

            return bookings;
        }
    }
}
