using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace HotelBookingSystem.Api.Services.Hotels
{
    public class HotelManagementService
    {
        private readonly AppDbContext _context;

        public HotelManagementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ManagedHotelResponse>> GetHotelsAsync()
        {
            return await _context.Hotels
                .AsNoTracking()
                .Select(ManagedHotelProjection())
                .ToListAsync();
        }

        public async Task<ManagedHotelResponse> GetHotelByIdAsync(int id)
        {
            return await GetManagedHotelAsync(id);
        }

        public async Task<ManagedHotelResponse> CreateHotelAsync(CreateHotelRequest req, int? ownerId = null)
        {
            if (req.RoomTypes.Count == 0)
                throw new ValidationException("Перед созданием отеля добавьте хотя бы один тип номера.");

            ValidateRoomNumbersUniqueInHotel(req.RoomTypes);

            if (ownerId.HasValue)
            {
                var ownerExists = await _context.Users.AnyAsync(u => u.Id == ownerId.Value && u.Role == Role.Owner);
                if (!ownerExists)
                    throw new NotFoundException("Владелец не найден.");
            }

            var hotelImages = NormalizeImageUrls(req.ImageUrl, req.ImageUrls);

            var hotel = new Hotel
            {
                Name = req.Name.Trim(),
                Description = NormalizeOptionalText(req.Description),
                ImageUrl = hotelImages.FirstOrDefault(),
                ImageUrls = hotelImages,
                Amenities = NormalizeTags(req.Amenities),
                City = req.City.Trim(),
                Address = req.Address.Trim(),
                OwnerId = ownerId,
                IsActive = true,
                RoomTypes = req.RoomTypes.Select(rt =>
                {
                    ValidateRoomType(rt.Name, rt.Capacity, rt.Price, rt.Rooms.Count);
                    var roomTypeImages = NormalizeImageUrls(rt.ImageUrl, rt.ImageUrls);

                    return new RoomType
                    {
                        Name = rt.Name.Trim(),
                        Description = NormalizeOptionalText(rt.Description),
                        ImageUrl = roomTypeImages.FirstOrDefault(),
                        ImageUrls = roomTypeImages,
                        Amenities = NormalizeTags(rt.Amenities),
                        MealOptions = NormalizeTags(rt.MealOptions),
                        Capacity = rt.Capacity,
                        Price = rt.Price,
                        IsActive = true,
                        Rooms = rt.Rooms.Select(r => new Room
                        {
                            Number = r.Number.Trim(),
                            IsActive = true
                        }).ToList()
                    };
                }).ToList()
            };

            foreach (var room in hotel.RoomTypes.SelectMany(rt => rt.Rooms))
            {
                room.Hotel = hotel;
            }

            _context.Hotels.Add(hotel);
            await SaveChangesHandlingRoomNumberConflictAsync();

            return await GetManagedHotelAsync(hotel.Id);
        }

        public async Task<ManagedHotelResponse> CreateOwnerHotelAsync(int ownerId, CreateHotelRequest req)
        {
            return await CreateHotelAsync(req, ownerId);
        }

        public async Task<ManagedHotelResponse> UpdateHotelAsync(int hotelId, UpdateHotelRequest req)
        {
            var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId)
                ?? throw new NotFoundException("Отель не найден.");

            ApplyHotelChanges(hotel, req);
            await _context.SaveChangesAsync();

            return await GetManagedHotelAsync(hotel.Id);
        }

        public async Task DeactivateHotelAsync(int hotelId)
        {
            var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId)
                ?? throw new NotFoundException("Отель не найден.");

            if (!hotel.IsActive)
                return;

            hotel.IsActive = false;
            await _context.SaveChangesAsync();
        }

        public async Task<ManagedHotelResponse> AssignHotelOwnerAsync(int hotelId, int ownerId)
        {
            var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId)
                ?? throw new NotFoundException("Отель не найден.");

            var owner = await _context.Users.FirstOrDefaultAsync(u => u.Id == ownerId)
                ?? throw new NotFoundException("Пользователь не найден.");

            if (owner.Role != Role.Owner)
                throw new ValidationException("Пользователь должен иметь роль владельца.");

            hotel.OwnerId = owner.Id;
            await _context.SaveChangesAsync();

            return await GetManagedHotelAsync(hotel.Id);
        }

        public async Task<List<ManagedHotelResponse>> GetOwnerHotelsAsync(int ownerId)
        {
            return await _context.Hotels
                .AsNoTracking()
                .Where(h => h.OwnerId == ownerId)
                .Select(ManagedHotelProjection())
                .ToListAsync();
        }

        public async Task<ManagedHotelResponse> GetOwnerHotelByIdAsync(int ownerId, int hotelId)
        {
            return await _context.Hotels
                .AsNoTracking()
                .Where(h => h.Id == hotelId && h.OwnerId == ownerId)
                .Select(ManagedHotelProjection())
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Отель не найден.");
        }

        public async Task<ManagedHotelResponse> UpdateOwnerHotelAsync(int ownerId, int hotelId, UpdateHotelRequest req)
        {
            var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId && h.OwnerId == ownerId)
                ?? throw new NotFoundException("Отель не найден.");

            ApplyHotelChanges(hotel, req);
            await _context.SaveChangesAsync();

            return await GetManagedHotelAsync(hotel.Id);
        }

        private async Task SaveChangesHandlingRoomNumberConflictAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueRoomNumberViolation(ex))
            {
                throw new ConflictException("Такой номер комнаты уже есть в этом отеле.");
            }
        }

        private static void ApplyHotelChanges(Hotel hotel, UpdateHotelRequest req)
        {
            var imageUrls = NormalizeImageUrls(req.ImageUrl, req.ImageUrls);

            hotel.Name = req.Name.Trim();
            hotel.Description = NormalizeOptionalText(req.Description);
            hotel.ImageUrl = imageUrls.FirstOrDefault();
            hotel.ImageUrls = imageUrls;
            hotel.Amenities = NormalizeTags(req.Amenities);
            hotel.City = req.City.Trim();
            hotel.Address = req.Address.Trim();
        }

        private static string[] NormalizeImageUrls(string? imageUrl, IEnumerable<string>? imageUrls)
        {
            var normalized = new List<string>();

            AddImageUrl(imageUrl);

            if (imageUrls is not null)
            {
                foreach (var value in imageUrls)
                    AddImageUrl(value);
            }

            return normalized
                .Distinct(StringComparer.Ordinal)
                .Take(10)
                .ToArray();

            void AddImageUrl(string? value)
            {
                if (string.IsNullOrWhiteSpace(value))
                    return;

                normalized.Add(value.Trim());
            }
        }

        private static string[] NormalizeTags(IEnumerable<string>? values)
        {
            return values is null
                ? []
                : values
                    .Select(value => value.Trim())
                    .Where(value => value.Length > 0)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .Take(30)
                    .ToArray();
        }

        private static string? NormalizeOptionalText(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static void ValidateRoomType(string name, int capacity, decimal price, int roomsCount)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ValidationException("Название типа номера обязательно.");

            if (capacity <= 0)
                throw new ValidationException("Вместимость номера должна быть больше нуля.");

            if (price <= 0)
                throw new ValidationException("Цена номера должна быть больше нуля.");

            if (roomsCount <= 0)
                throw new ValidationException("Для каждого типа номера добавьте хотя бы один номер комнаты.");
        }

        private static void ValidateRoomNumbersUniqueInHotel(IEnumerable<RoomTypeRequest> roomTypes)
        {
            var duplicateRoomNumber = roomTypes
                .SelectMany(roomType => roomType.Rooms)
                .Select(room => room.Number.Trim())
                .Where(roomNumber => roomNumber.Length > 0)
                .GroupBy(roomNumber => roomNumber, StringComparer.Ordinal)
                .FirstOrDefault(group => group.Count() > 1)
                ?.Key;

            if (duplicateRoomNumber is not null)
                throw new ConflictException($"Номер комнаты {duplicateRoomNumber} уже есть в этом отеле.");
        }

        private async Task<ManagedHotelResponse> GetManagedHotelAsync(int hotelId)
        {
            return await _context.Hotels
                .AsNoTracking()
                .Where(h => h.Id == hotelId)
                .Select(ManagedHotelProjection())
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Отель не найден.");
        }

        private static Expression<Func<Hotel, ManagedHotelResponse>> ManagedHotelProjection() => h => new ManagedHotelResponse
        {
            Id = h.Id,
            Name = h.Name,
            Description = h.Description,
            ImageUrl = h.ImageUrl,
            ImageUrls = h.ImageUrls,
            Amenities = h.Amenities,
            City = h.City,
            Address = h.Address,
            IsActive = h.IsActive,
            OwnerId = h.OwnerId,
            RoomTypes = h.RoomTypes.Select(rt => new ManagedRoomTypeResponse
            {
                Id = rt.Id,
                HotelId = rt.HotelId,
                Name = rt.Name,
                Description = rt.Description,
                ImageUrl = rt.ImageUrl,
                ImageUrls = rt.ImageUrls,
                Amenities = rt.Amenities,
                MealOptions = rt.MealOptions,
                Capacity = rt.Capacity,
                Price = rt.Price,
                IsActive = rt.IsActive,
                TotalRooms = rt.Rooms.Count(),
                ActiveRooms = rt.Rooms.Count(r => r.IsActive),
                Rooms = rt.Rooms
                    .OrderBy(r => r.Number)
                    .Select(r => new RoomResponse
                    {
                        Id = r.Id,
                        RoomTypeId = r.RoomTypeId,
                        Number = r.Number,
                        IsActive = r.IsActive
                    })
                    .ToList()
            }).ToList()
        };
    }
}
