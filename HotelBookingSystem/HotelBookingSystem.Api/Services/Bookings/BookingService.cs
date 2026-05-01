using HotelBookingSystem.Api.Contracts.Bookings;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services.Bookings
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

            if (req.GuestsCount <= 0)
                throw new ValidationException("Guests count must be greater than zero.");

            var roomType = await _context.RoomTypes
                .AsNoTracking()
                .Where(rt => rt.IsActive && rt.Hotel.IsActive && rt.Id == req.RoomTypeId)
                .Select(rt => new
                {
                    rt.Id,
                    rt.Capacity,
                    rt.Price
                })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Room type not found");

            if (req.GuestsCount > roomType.Capacity)
                throw new ValidationException("Guests count exceeds room capacity.");

            var room = await _context.Rooms
                .Where(r => r.IsActive && 
                       r.RoomTypeId == req.RoomTypeId && 
                       r.RoomType.IsActive &&
                       r.RoomType.Hotel.IsActive)
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
                GuestsCount = req.GuestsCount,
                TotalPrice = (req.CheckOutDate.DayNumber - req.CheckInDate.DayNumber) * roomType.Price,
                Status = BookingStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (DbExceptionHelper.IsBookingOverlapViolation(ex))
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
                    GuestsCount = b.GuestsCount,
                    TotalPrice = b.TotalPrice,
                    Status = BookingDisplayStatus.Active,
                    CreatedAt = b.CreatedAt,
                    CancelledAt = b.CancelledAt
                })
                .FirstAsync();

            return bookingResponse;
        }

        public async Task<List<BookingResponse>> GetUserBookingsAsync(int userId)
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
                    GuestsCount = b.GuestsCount,
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

        public async Task CancelUserBookingAsync(int userId, int bookingId)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId)
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



        public async Task<List<BookingResponse>> GetAllBookingsAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Today);

            var bookings = await _context.Bookings
                .AsNoTracking()
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookingResponse
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    RoomId = b.RoomId,
                    HotelName = b.Room.RoomType.Hotel.Name,
                    RoomTypeName = b.Room.RoomType.Name,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    GuestsCount = b.GuestsCount,
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

        public async Task CancelAnyBookingAsync(int bookingId)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId)
                ?? throw new NotFoundException("Booking not found.");

            CancelBooking(booking);
            await _context.SaveChangesAsync();
        }

        public async Task<BookingResponse> CreateBookingForUserAsync(int userId, CreateBookingRequest req)
        {
            var targetUser = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new { u.Id, u.Role })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("User not found.");

            if (targetUser.Role != Role.User)
                throw new ValidationException("Booking can be created only for a regular user account.");

            return await CreateBookingAsync(userId, req);
        }



        public async Task<List<BookingResponse>> GetOwnerHotelBookingsAsync(int hotelId, int ownerId)
        {
            var hotelExists = await _context.Hotels.AsNoTracking().AnyAsync(h => h.Id == hotelId && h.OwnerId == ownerId);

            if (!hotelExists)
                throw new NotFoundException("Hotel not found.");

            var today = DateOnly.FromDateTime(DateTime.Today);

            var bookings = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.Room.RoomType.HotelId == hotelId)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookingResponse
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    RoomId = b.RoomId,
                    HotelName = b.Room.RoomType.Hotel.Name,
                    RoomTypeName = b.Room.RoomType.Name,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    GuestsCount = b.GuestsCount,
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

        public async Task CancelOwnerHotelBookingAsync(int bookingId, int ownerId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .ThenInclude(r => r.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .FirstOrDefaultAsync(b => b.Id == bookingId)
                ?? throw new NotFoundException("Booking not found.");

            if (booking.Room.RoomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Booking not found.");

            CancelBooking(booking);
            await _context.SaveChangesAsync();
        }


     
        private static void CancelBooking(Booking booking)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);

            if (booking.Status == BookingStatus.Cancelled)
                throw new ValidationException("Booking is already cancelled.");

            if (today >= booking.CheckInDate)
                throw new ValidationException("Booking can be cancelled only before check-in.");

            booking.Status = BookingStatus.Cancelled;
            booking.CancelledAt = DateTime.UtcNow;
        }
    }
}
