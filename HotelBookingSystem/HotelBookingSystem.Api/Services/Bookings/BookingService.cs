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
        private readonly BookingConfirmationEmailService _confirmationEmailService;

        public BookingService(AppDbContext context, BookingConfirmationEmailService confirmationEmailService)
        {
            _context = context;
            _confirmationEmailService = confirmationEmailService;
        }

        public async Task<BookingResponse> CreateBookingAsync(int userId, CreateBookingRequest req)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.Email
                })
                .FirstOrDefaultAsync();

            if (user is null)
                throw new NotFoundException("Пользователь не найден.");

            if (req.CheckInDate >= req.CheckOutDate)
                throw new ValidationException("Дата заезда должна быть раньше даты выезда.");

            var today = DateOnly.FromDateTime(DateTime.Today);

            if (req.CheckInDate < today)
                throw new ValidationException("Дата заезда не может быть раньше сегодняшней даты.");

            if (req.GuestsCount <= 0)
                throw new ValidationException("Количество гостей должно быть больше нуля.");

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
                ?? throw new NotFoundException("Тип номера не найден.");

            if (req.GuestsCount > roomType.Capacity)
                throw new ValidationException("Количество гостей превышает вместимость номера.");

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
                ?? throw new ConflictException("На выбранные даты нет доступных номеров этого типа.");

            var guestEmail = NormalizeRequiredText(req.GuestEmail, "Email гостя обязателен.").ToLowerInvariant();
            var guestCountry = NormalizeOptionalText(req.GuestCountry);
            var guestPhoneNumber = NormalizeOptionalText(req.GuestPhoneNumber);

            var booking = new Booking
            {
                UserId = userId,
                RoomId = room.Id,
                CheckInDate = req.CheckInDate,
                CheckOutDate = req.CheckOutDate,
                GuestsCount = req.GuestsCount,
                TotalPrice = (req.CheckOutDate.DayNumber - req.CheckInDate.DayNumber) * roomType.Price,
                GuestEmail = guestEmail,
                GuestCountry = guestCountry,
                GuestPhoneNumber = guestPhoneNumber,
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
                throw new ConflictException("На выбранные даты нет доступных номеров этого типа.");
            }

            var bookingResponse = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.Id == booking.Id)
                .Select(b => new BookingResponse
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    RoomId = b.RoomId,
                    HotelId = b.Room.RoomType.HotelId,
                    HotelName = b.Room.RoomType.Hotel.Name,
                    HotelImageUrl = b.Room.RoomType.Hotel.ImageUrl,
                    HotelImageUrls = b.Room.RoomType.Hotel.ImageUrls,
                    RoomTypeName = b.Room.RoomType.Name,
                    RoomNumber = b.Room.Number,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    GuestsCount = b.GuestsCount,
                    TotalPrice = b.TotalPrice,
                    GuestEmail = b.GuestEmail,
                    GuestCountry = b.GuestCountry,
                    GuestPhoneNumber = b.GuestPhoneNumber,
                    Status = BookingDisplayStatus.Active,
                    CreatedAt = b.CreatedAt,
                    CancelledAt = b.CancelledAt
                })
                .FirstAsync();

            await _confirmationEmailService.SendBookingConfirmationAsync(bookingResponse);

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
                    HotelId = b.Room.RoomType.HotelId,
                    HotelName = b.Room.RoomType.Hotel.Name,
                    HotelImageUrl = b.Room.RoomType.Hotel.ImageUrl,
                    HotelImageUrls = b.Room.RoomType.Hotel.ImageUrls,
                    RoomTypeName = b.Room.RoomType.Name,
                    RoomNumber = b.Room.Number,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    GuestsCount = b.GuestsCount,
                    TotalPrice = b.TotalPrice,
                    GuestEmail = b.GuestEmail,
                    GuestCountry = b.GuestCountry,
                    GuestPhoneNumber = b.GuestPhoneNumber,
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
                ?? throw new NotFoundException("Бронирование не найдено.");

            var today = DateOnly.FromDateTime(DateTime.Today);

            if (booking.Status == BookingStatus.Cancelled)
                throw new ValidationException("Бронирование уже отменено.");

            if (today >= booking.CheckInDate)
                throw new ValidationException("Бронирование можно отменить только до заезда.");

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
                    HotelId = b.Room.RoomType.HotelId,
                    HotelName = b.Room.RoomType.Hotel.Name,
                    HotelImageUrl = b.Room.RoomType.Hotel.ImageUrl,
                    HotelImageUrls = b.Room.RoomType.Hotel.ImageUrls,
                    RoomTypeName = b.Room.RoomType.Name,
                    RoomNumber = b.Room.Number,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    GuestsCount = b.GuestsCount,
                    TotalPrice = b.TotalPrice,
                    GuestEmail = b.GuestEmail,
                    GuestCountry = b.GuestCountry,
                    GuestPhoneNumber = b.GuestPhoneNumber,
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
                ?? throw new NotFoundException("Бронирование не найдено.");

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
                ?? throw new NotFoundException("Пользователь не найден.");

            if (targetUser.Role != Role.User)
                throw new ValidationException("Бронирование можно создать только для обычного пользовательского аккаунта.");

            return await CreateBookingAsync(userId, req);
        }



        public async Task<List<BookingResponse>> GetOwnerHotelBookingsAsync(int hotelId, int ownerId)
        {
            var hotelExists = await _context.Hotels.AsNoTracking().AnyAsync(h => h.Id == hotelId && h.OwnerId == ownerId);

            if (!hotelExists)
                throw new NotFoundException("Отель не найден.");

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
                    HotelId = b.Room.RoomType.HotelId,
                    HotelName = b.Room.RoomType.Hotel.Name,
                    HotelImageUrl = b.Room.RoomType.Hotel.ImageUrl,
                    HotelImageUrls = b.Room.RoomType.Hotel.ImageUrls,
                    RoomTypeName = b.Room.RoomType.Name,
                    RoomNumber = b.Room.Number,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    GuestsCount = b.GuestsCount,
                    TotalPrice = b.TotalPrice,
                    GuestEmail = b.GuestEmail,
                    GuestCountry = b.GuestCountry,
                    GuestPhoneNumber = b.GuestPhoneNumber,
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
                ?? throw new NotFoundException("Бронирование не найдено.");

            if (booking.Room.RoomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Бронирование не найдено.");

            CancelBooking(booking);
            await _context.SaveChangesAsync();
        }


     
        private static void CancelBooking(Booking booking)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);

            if (booking.Status == BookingStatus.Cancelled)
                throw new ValidationException("Бронирование уже отменено.");

            if (today >= booking.CheckInDate)
                throw new ValidationException("Бронирование можно отменить только до заезда.");

            booking.Status = BookingStatus.Cancelled;
            booking.CancelledAt = DateTime.UtcNow;
        }

        private static string NormalizeRequiredText(string? value, string errorMessage)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrWhiteSpace(trimmed) ? throw new ValidationException(errorMessage) : trimmed;
        }

        private static string? NormalizeOptionalText(string? value)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
        }
    }
}
