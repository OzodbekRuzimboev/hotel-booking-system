using HotelBookingSystem.Api.Contracts.Hotels;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services.Hotels
{
    public class HotelSearchService
    {
        private readonly AppDbContext _context;

        public HotelSearchService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<HotelSearchResponse>> GetAvailableHotelsAsync(HotelSearchRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.City))
                throw new ValidationException("City is required.");

            if (req.CheckInDate >= req.CheckOutDate)
                throw new ValidationException("Check-in date must be earlier than check-out date.");

            var today = DateOnly.FromDateTime(DateTime.Today);

            if (req.CheckInDate < today)
                throw new ValidationException("Check-in date cannot be earlier than today.");

            if (req.GuestsCount <= 0)
                throw new ValidationException("Guests count must be greater than zero.");

            if (req.MinNightlyPrice is <= 0 || req.MaxNightlyPrice is <= 0)
                throw new ValidationException("Nightly budget must be greater than zero.");

            if (req.MinNightlyPrice is not null &&
                req.MaxNightlyPrice is not null &&
                req.MinNightlyPrice > req.MaxNightlyPrice)
                throw new ValidationException("Minimum nightly budget cannot be greater than maximum nightly budget.");

            var normalizedCity = req.City.Trim();
            var hotelAmenities = NormalizeTags(req.HotelAmenities);
            var roomAmenities = NormalizeTags(req.RoomAmenities);
            var mealOptions = NormalizeTags(req.MealOptions);

            var hotels = await _context.Hotels
                .AsNoTracking()
                .Where(h => h.IsActive)
                .Where(h => EF.Functions.ILike(h.City, normalizedCity))
                .Where(h => h.RoomTypes.Any(rt =>
                    rt.IsActive &&
                    rt.Capacity >= req.GuestsCount &&
                    rt.Rooms.Any(r =>
                        r.IsActive &&
                        !r.Bookings.Any(b =>
                            b.Status == BookingStatus.Active &&
                            b.CheckInDate < req.CheckOutDate &&
                            b.CheckOutDate > req.CheckInDate))))
                .Select(h => new HotelSearchResponse
                {
                    Id = h.Id,
                    Name = h.Name,
                    Description = h.Description,
                    ImageUrl = h.ImageUrl,
                    ImageUrls = h.ImageUrls,
                    City = h.City,
                    Address = h.Address,
                    Amenities = h.Amenities,
                    AverageRating = h.Reviews.Any() ? h.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = h.Reviews.Count,
                    RoomTypes = h.RoomTypes
                        .Where(rt => rt.IsActive)
                        .Where(rt => rt.Capacity >= req.GuestsCount)
                        .Where(rt => rt.Rooms.Any(r =>
                            r.IsActive &&
                            !r.Bookings.Any(b =>
                                b.Status == BookingStatus.Active &&
                                b.CheckInDate < req.CheckOutDate &&
                                b.CheckOutDate > req.CheckInDate)))
                        .Select(rt => new AvailableRoomTypeResponse
                        {
                            RoomTypeId = rt.Id,
                            Name = rt.Name,
                            Description = rt.Description,
                            ImageUrl = rt.ImageUrl,
                            ImageUrls = rt.ImageUrls,
                            Amenities = rt.Amenities,
                            MealOptions = rt.MealOptions,
                            Capacity = rt.Capacity,
                            Price = rt.Price,
                            AvailableCount = rt.Rooms.Count(r =>
                                r.IsActive &&
                                !r.Bookings.Any(b =>
                                    b.Status == BookingStatus.Active &&
                                    b.CheckInDate < req.CheckOutDate &&
                                    b.CheckOutDate > req.CheckInDate))
                        })
                        .ToList()
                })
                .ToListAsync();

            return hotels
                .Where(hotel => ContainsAll(hotel.Amenities, hotelAmenities))
                .Select(hotel =>
                {
                    hotel.RoomTypes = hotel.RoomTypes
                        .Where(roomType => req.MinNightlyPrice is null || roomType.Price >= req.MinNightlyPrice.Value)
                        .Where(roomType => req.MaxNightlyPrice is null || roomType.Price <= req.MaxNightlyPrice.Value)
                        .Where(roomType => ContainsAll(roomType.Amenities, roomAmenities))
                        .Where(roomType => ContainsAll(roomType.MealOptions, mealOptions))
                        .ToList();
                    return hotel;
                })
                .Where(hotel => hotel.RoomTypes.Count > 0)
                .ToList();
        }

        public async Task<HotelSearchResponse> GetPublicHotelDetailsAsync(int hotelId, PublicHotelDetailsRequest req)
        {
            if (req.CheckInDate >= req.CheckOutDate)
                throw new ValidationException("Check-in date must be earlier than check-out date.");

            var today = DateOnly.FromDateTime(DateTime.Today);

            if (req.CheckInDate < today)
                throw new ValidationException("Check-in date cannot be earlier than today.");

            if (req.GuestsCount <= 0)
                throw new ValidationException("Guests count must be greater than zero.");

            var hotel = await _context.Hotels
                .AsNoTracking()
                .Where(h => h.Id == hotelId && h.IsActive)
                .Select(h => new HotelSearchResponse
                {
                    Id = h.Id,
                    Name = h.Name,
                    Description = h.Description,
                    ImageUrl = h.ImageUrl,
                    ImageUrls = h.ImageUrls,
                    City = h.City,
                    Address = h.Address,
                    Amenities = h.Amenities,
                    AverageRating = h.Reviews.Any() ? h.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = h.Reviews.Count,

                    RoomTypes = h.RoomTypes
                        .Where(rt => rt.IsActive)
                        .Where(rt => rt.Capacity >= req.GuestsCount)
                        .Where(rt => rt.Rooms.Any(r =>
                            r.IsActive &&
                            !r.Bookings.Any(b =>
                                b.Status == BookingStatus.Active &&
                                b.CheckInDate < req.CheckOutDate &&
                                b.CheckOutDate > req.CheckInDate)))
                        .Select(rt => new AvailableRoomTypeResponse
                        {
                            RoomTypeId = rt.Id,
                            Name = rt.Name,
                            Description = rt.Description,
                            ImageUrl = rt.ImageUrl,
                            ImageUrls = rt.ImageUrls,
                            Amenities = rt.Amenities,
                            MealOptions = rt.MealOptions,
                            Capacity = rt.Capacity,
                            Price = rt.Price,
                            AvailableCount = rt.Rooms.Count(r =>
                                r.IsActive &&
                                !r.Bookings.Any(b =>
                                    b.Status == BookingStatus.Active &&
                                    b.CheckInDate < req.CheckOutDate &&
                                    b.CheckOutDate > req.CheckInDate))
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Hotel not found.");

            return hotel;
        }

        private static string[] NormalizeTags(IEnumerable<string>? values)
        {
            return values is null
                ? []
                : values
                    .Select(value => value.Trim())
                    .Where(value => value.Length > 0)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToArray();
        }

        private static bool ContainsAll(IEnumerable<string> values, IEnumerable<string> required)
        {
            var available = values.ToHashSet(StringComparer.OrdinalIgnoreCase);
            return required.All(available.Contains);
        }
    }
}
