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

        public async Task<List<HotelResponse>> GetHotelsAsync()
        {
            var hotels = await _context.Hotels.AsNoTracking().Select(h => new HotelResponse
            {
                Id = h.Id,
                Name = h.Name,
                Description = h.Description,
                City = h.City,
                Address = h.Address
            }).ToListAsync();

            return hotels;
        }

        public async Task<HotelDetailsResponse> GetHotelByIdAsync(int id)
        {
            var hotel = await _context.Hotels
                .AsNoTracking()
                .Where(h => h.Id == id)
                .Select(h => new HotelDetailsResponse
                {
                    Id = h.Id,
                    Name = h.Name,
                    Description = h.Description,
                    City = h.City,
                    Address = h.Address,
                    RoomTypes = h.RoomTypes
                        .Select(rt => new RoomTypeResponse
                        {
                            Id = rt.Id,
                            Name = rt.Name,
                            Description = rt.Description,
                            Capacity = rt.Capacity,
                            Price = rt.Price,
                            TotalCount = rt.Rooms.Count()
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Hotel not found.");

            return hotel;
        }

        public async Task<List<HotelSearchResponse>> GetAvailableHotelsAsync(string city, DateOnly checkInDate, DateOnly checkOutDate)
        {
            if (string.IsNullOrWhiteSpace(city))
                throw new ValidationException("City is required.");

            if (checkInDate >= checkOutDate)
                throw new ValidationException("Check-in date must be earlier than check-out date.");

            var today = DateOnly.FromDateTime(DateTime.Today);

            if (checkInDate < today)
                throw new ValidationException("Check-in date cannot be earlier than today.");

            var normalizedCity = city.Trim();

            var hotels = await _context.Hotels
                .AsNoTracking()
                .Where(h => EF.Functions.ILike(h.City, normalizedCity))
                .Where(h => h.RoomTypes.Any(rt =>
                    rt.Rooms.Any(r =>
                        !r.Bookings.Any(b =>
                            b.Status == BookingStatus.Active &&
                            b.CheckInDate < checkOutDate &&
                            b.CheckOutDate > checkInDate))))
                .Select(h => new HotelSearchResponse
                {
                    Id = h.Id,
                    Name = h.Name,
                    City = h.City,
                    Address = h.Address,
                    RoomTypes = h.RoomTypes
                        .Where(rt => rt.Rooms.Any(r =>
                            !r.Bookings.Any(b =>
                                b.Status == BookingStatus.Active &&
                                b.CheckInDate < checkOutDate &&
                                b.CheckOutDate > checkInDate)))
                        .Select(rt => new AvailableRoomTypeResponse
                        {
                            RoomTypeId = rt.Id,
                            Name = rt.Name,
                            Description = rt.Description,
                            Capacity = rt.Capacity,
                            Price = rt.Price,
                            AvailableCount = rt.Rooms.Count(r =>
                                !r.Bookings.Any(b =>
                                    b.Status == BookingStatus.Active &&
                                    b.CheckInDate < checkOutDate &&
                                    b.CheckOutDate > checkInDate))
                        })
                        .ToList()
                })
                .ToListAsync();

            return hotels;
        }
    }
}
