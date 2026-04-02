using HotelBookingSystem.Api.Contracts.Hotels;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services
{
    public class HotelService
    {
        private readonly AppDbContext _context;

        public HotelService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<HotelDetailsResponse>> GetAvailableHotelsAsync(string city, DateOnly checkInDate, DateOnly checkOutDate)
        {
            if (checkInDate >= checkOutDate)
                throw new ValidationException("Check-in date must be earlier than check-out date.");

            var normalizedCity = city.Trim();

            var hotels = await _context.Hotels.AsNoTracking()
                .Where(h => EF.Functions.ILike(h.City, normalizedCity))
                .Where(h => h.Rooms.Any(r => !r.Bookings.Any(b => b.Status == BookingStatus.Active && b.CheckInDate < checkOutDate && b.CheckOutDate > checkInDate)))
                .Select(h => new HotelDetailsResponse
                {
                    Id = h.Id,
                    Name = h.Name,
                    City = h.City,
                    Address = h.Address,
                    Rooms = h.Rooms
                        .Where(r => !r.Bookings.Any(b => b.Status == BookingStatus.Active && b.CheckInDate < checkOutDate && b.CheckOutDate > checkInDate))
                        .Select(r => new RoomResponse
                        {
                            Id = r.Id,
                            Name = r.Name,
                            Capacity = r.Capacity,
                            Price = r.Price
                        }).ToList()
                })
                .ToListAsync();
            
            return hotels;
        }
    }
}
