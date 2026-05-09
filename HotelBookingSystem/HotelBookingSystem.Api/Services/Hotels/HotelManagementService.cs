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
                throw new ValidationException("Add at least one room type before creating a hotel.");

            if (ownerId.HasValue)
            {
                var ownerExists = await _context.Users.AnyAsync(u => u.Id == ownerId.Value && u.Role == Role.Owner);
                if (!ownerExists)
                    throw new NotFoundException("Owner not found.");
            }

            var hotel = new Hotel
            {
                Name = req.Name.Trim(),
                Description = NormalizeOptionalText(req.Description),
                ImageUrl = NormalizeImageUrl(req.ImageUrl),
                City = req.City.Trim(),
                Address = req.Address.Trim(),
                OwnerId = ownerId,
                IsActive = true,
                RoomTypes = req.RoomTypes.Select(rt =>
                {
                    ValidateRoomType(rt.Name, rt.Capacity, rt.Price, rt.Rooms.Count);

                    return new RoomType
                    {
                        Name = rt.Name.Trim(),
                        Description = NormalizeOptionalText(rt.Description),
                        ImageUrl = NormalizeImageUrl(rt.ImageUrl),
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
                ?? throw new NotFoundException("Hotel not found.");

            ApplyHotelChanges(hotel, req);
            await _context.SaveChangesAsync();

            return await GetManagedHotelAsync(hotel.Id);
        }

        public async Task DeactivateHotelAsync(int hotelId)
        {
            var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId)
                ?? throw new NotFoundException("Hotel not found.");

            if (!hotel.IsActive)
                return;

            hotel.IsActive = false;
            await _context.SaveChangesAsync();
        }

        public async Task<ManagedHotelResponse> AssignHotelOwnerAsync(int hotelId, int ownerId)
        {
            var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId)
                ?? throw new NotFoundException("Hotel not found.");

            var owner = await _context.Users.FirstOrDefaultAsync(u => u.Id == ownerId)
                ?? throw new NotFoundException("User not found.");

            if (owner.Role != Role.Owner)
                throw new ValidationException("User must have Owner role.");

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

        public async Task<ManagedHotelResponse> UpdateOwnerHotelAsync(int ownerId, int hotelId, UpdateHotelRequest req)
        {
            var hotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId && h.OwnerId == ownerId)
                ?? throw new NotFoundException("Hotel not found.");

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
                throw new ConflictException("Room number already exists in this hotel.");
            }
        }

        private static void ApplyHotelChanges(Hotel hotel, UpdateHotelRequest req)
        {
            hotel.Name = req.Name.Trim();
            hotel.Description = NormalizeOptionalText(req.Description);
            hotel.ImageUrl = NormalizeImageUrl(req.ImageUrl);
            hotel.City = req.City.Trim();
            hotel.Address = req.Address.Trim();
        }

        private static string? NormalizeImageUrl(string? imageUrl)
        {
            return string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
        }

        private static string? NormalizeOptionalText(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static void ValidateRoomType(string name, int capacity, decimal price, int roomsCount)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ValidationException("Room type name is required.");

            if (capacity <= 0)
                throw new ValidationException("Room capacity must be greater than zero.");

            if (price <= 0)
                throw new ValidationException("Room price must be greater than zero.");

            if (roomsCount <= 0)
                throw new ValidationException("Add at least one room number for each room type.");
        }

        private async Task<ManagedHotelResponse> GetManagedHotelAsync(int hotelId)
        {
            return await _context.Hotels
                .AsNoTracking()
                .Where(h => h.Id == hotelId)
                .Select(ManagedHotelProjection())
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Hotel not found.");
        }

        private static Expression<Func<Hotel, ManagedHotelResponse>> ManagedHotelProjection() => h => new ManagedHotelResponse
        {
            Id = h.Id,
            Name = h.Name,
            Description = h.Description,
            ImageUrl = h.ImageUrl,
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
