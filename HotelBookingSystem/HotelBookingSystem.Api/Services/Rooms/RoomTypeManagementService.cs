using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services.Rooms
{
    public class RoomTypeManagementService
    {
        private readonly AppDbContext _context;

        public RoomTypeManagementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ManagedRoomTypeResponse> CreateRoomTypeAsync(int hotelId, RoomTypeRequest req)
        {
            ValidateRoomType(req.Name, req.Capacity, req.Price, req.Rooms.Count);

            var hotelExists = await _context.Hotels.AnyAsync(h => h.Id == hotelId);
            if (!hotelExists)
                throw new NotFoundException("Hotel not found.");

            var roomType = new RoomType
            {
                HotelId = hotelId,
                Name = req.Name.Trim(),
                Description = req.Description,
                ImageUrl = NormalizeImageUrl(req.ImageUrl),
                Capacity = req.Capacity,
                Price = req.Price,
                IsActive = true,
                Rooms = req.Rooms.Select(r => new Room
                {
                    Number = r.Number.Trim(),
                    IsActive = true
                }).ToList()
            };

            _context.RoomTypes.Add(roomType);
            await SaveChangesHandlingRoomNumberConflictAsync();

            return await GetManagedRoomTypeAsync(roomType.Id);
        }

        public async Task<ManagedRoomTypeResponse> UpdateRoomTypeAsync(int roomTypeId, UpdateRoomTypeRequest req)
        {
            var roomType = await _context.RoomTypes.FirstOrDefaultAsync(rt => rt.Id == roomTypeId)
                ?? throw new NotFoundException("Room type not found.");

            ApplyRoomTypeChanges(roomType, req);
            await _context.SaveChangesAsync();

            return await GetManagedRoomTypeAsync(roomType.Id);
        }

        public async Task DeactivateRoomTypeAsync(int roomTypeId)
        {
            var roomType = await _context.RoomTypes.FirstOrDefaultAsync(rt => rt.Id == roomTypeId)
                ?? throw new NotFoundException("Room type not found.");

            if (!roomType.IsActive)
                return;

            roomType.IsActive = false;

            await _context.SaveChangesAsync();
        }



        public async Task<ManagedRoomTypeResponse> CreateOwnerRoomTypeAsync(int ownerId, int hotelId, RoomTypeRequest req)
        {
            var hotelExists = await _context.Hotels.AnyAsync(h => h.Id == hotelId && h.OwnerId == ownerId);

            if (!hotelExists)
                throw new NotFoundException("Hotel not found.");

            return await CreateRoomTypeAsync(hotelId, req);
        }

        public async Task<ManagedRoomTypeResponse> UpdateOwnerRoomTypeAsync(int ownerId, int roomTypeId, UpdateRoomTypeRequest req)
        {
            var roomType = await _context.RoomTypes
                .Include(rt => rt.Hotel)
                .FirstOrDefaultAsync(rt => rt.Id == roomTypeId)
                ?? throw new NotFoundException("Room type not found.");

            if (roomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Room type not found.");

            ApplyRoomTypeChanges(roomType, req);
            await _context.SaveChangesAsync();

            return await GetManagedRoomTypeAsync(roomType.Id);
        }

        public async Task DeactivateOwnerRoomTypeAsync(int ownerId, int roomTypeId)
        {
            var roomType = await _context.RoomTypes.Include(rt => rt.Hotel).FirstOrDefaultAsync(rt => rt.Id == roomTypeId)
                ?? throw new NotFoundException("Room type not found.");

            if (roomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Room type not found.");

            if (!roomType.IsActive)
                return;

            roomType.IsActive = false;

            await _context.SaveChangesAsync();
        }



        private async Task SaveChangesHandlingRoomNumberConflictAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueRoomNumberViolation(ex))
            {
                throw new ConflictException("Room number already exists in this room type.");
            }
        }

        private static void ApplyRoomTypeChanges(RoomType roomType, UpdateRoomTypeRequest req)
        {
            ValidateRoomType(req.Name, req.Capacity, req.Price, roomsCount: 1);

            roomType.Name = req.Name.Trim();
            roomType.Description = req.Description;
            roomType.ImageUrl = NormalizeImageUrl(req.ImageUrl);
            roomType.Capacity = req.Capacity;
            roomType.Price = req.Price;
        }

        private static string? NormalizeImageUrl(string? imageUrl)
        {
            return string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
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
                throw new ValidationException("Add at least one room number for this room type.");
        }

        private async Task<ManagedRoomTypeResponse> GetManagedRoomTypeAsync(int roomTypeId)
        {
            return await _context.RoomTypes
                .AsNoTracking()
                .Where(rt => rt.Id == roomTypeId)
                .Select(rt => new ManagedRoomTypeResponse
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
                })
                .FirstAsync();
        }
    }
}
