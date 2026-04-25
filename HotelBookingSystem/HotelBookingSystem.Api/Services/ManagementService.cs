using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HotelBookingSystem.Api.Services
{
    public class ManagementService(AppDbContext context)
    {
        public async Task<List<ManagedHotelResponse>> GetOwnerHotelsAsync(int ownerId)
        {
            return await context.Hotels
                .AsNoTracking()
                .Where(h => h.OwnerId == ownerId)
                .Select(h => new ManagedHotelResponse
                {
                    Id = h.Id,
                    Name = h.Name,
                    Description = h.Description,
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
                        Capacity = rt.Capacity,
                        Price = rt.Price,
                        IsActive = rt.IsActive,
                        TotalRooms = rt.Rooms.Count(),
                        ActiveRooms = rt.Rooms.Count(r => r.IsActive)
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<ManagedHotelResponse> AssignHotelOwnerAsync(int hotelId, int ownerId)
        {
            var hotel = await context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId) 
                ?? throw new NotFoundException("Hotel not found.");

            var owner = await context.Users.FirstOrDefaultAsync(u => u.Id == ownerId) 
                ?? throw new NotFoundException("User not found.");

            if (owner.Role != Role.Owner)
                throw new ValidationException("User must have Owner role.");

            hotel.OwnerId = owner.Id;

            await context.SaveChangesAsync();

            return await GetManagedHotelAsync(hotel.Id);
        }

        public async Task<ManagedHotelResponse> UpdateHotelAsync(int hotelId, UpdateHotelRequest req)
        {
            var hotel = await context.Hotels
                .Include(h => h.RoomTypes)
                .ThenInclude(rt => rt.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId)
                ?? throw new NotFoundException("Hotel not found.");

            ApplyHotelUpdate(hotel, req);
            await context.SaveChangesAsync();

            return await GetManagedHotelAsync(hotel.Id);
        }

        public async Task<ManagedHotelResponse> UpdateOwnerHotelAsync(int ownerId, int hotelId, UpdateHotelRequest req)
        {
            var hotel = await context.Hotels
                .Include(h => h.RoomTypes)
                .ThenInclude(rt => rt.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId && h.OwnerId == ownerId)
                ?? throw new NotFoundException("Hotel not found.");

            ApplyHotelUpdate(hotel, req);
            await context.SaveChangesAsync();

            return await GetManagedHotelAsync(hotel.Id);
        }

        public async Task DeactivateHotelAsync(int hotelId)
        {
            var hotel = await context.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId)
                ?? throw new NotFoundException("Hotel not found.");

            if (!hotel.IsActive)
                return;

            hotel.IsActive = false;

            await context.SaveChangesAsync();
        }

        public async Task<ManagedRoomTypeResponse> CreateRoomTypeAsync(int hotelId, RoomTypeRequest req)
        {
            var hotelExists = await context.Hotels.AnyAsync(h => h.Id == hotelId);
            if (!hotelExists)
                throw new NotFoundException("Hotel not found.");

            var roomType = new RoomType
            {
                HotelId = hotelId,
                Name = req.Name.Trim(),
                Description = req.Description,
                Capacity = req.Capacity,
                Price = req.Price,
                IsActive = true,
                Rooms = req.Rooms.Select(r => new Room
                {
                    Number = r.Number.Trim(),
                    IsActive = true
                }).ToList()
            };

            context.RoomTypes.Add(roomType);
            await SaveChangesHandlingRoomNumberConflictAsync();

            return await GetManagedRoomTypeAsync(roomType.Id);
        }

        public async Task<ManagedRoomTypeResponse> CreateOwnerRoomTypeAsync(int ownerId, int hotelId, RoomTypeRequest req)
        {
            var hotelExists = await context.Hotels.AnyAsync(h => h.Id == hotelId && h.OwnerId == ownerId);
            if (!hotelExists)
                throw new NotFoundException("Hotel not found.");

            return await CreateRoomTypeAsync(hotelId, req);
        }

        public async Task<ManagedRoomTypeResponse> UpdateRoomTypeAsync(int roomTypeId, UpdateRoomTypeRequest req)
        {
            var roomType = await context.RoomTypes.FirstOrDefaultAsync(rt => rt.Id == roomTypeId)
                ?? throw new NotFoundException("Room type not found.");

            ApplyRoomTypeUpdate(roomType, req);
            await context.SaveChangesAsync();

            return await GetManagedRoomTypeAsync(roomType.Id);
        }

        public async Task<ManagedRoomTypeResponse> UpdateOwnerRoomTypeAsync(int ownerId, int roomTypeId, UpdateRoomTypeRequest req)
        {
            var roomType = await context.RoomTypes
                .Include(rt => rt.Hotel)
                .FirstOrDefaultAsync(rt => rt.Id == roomTypeId)
                ?? throw new NotFoundException("Room type not found.");

            if (roomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Room type not found.");

            ApplyRoomTypeUpdate(roomType, req);
            await context.SaveChangesAsync();

            return await GetManagedRoomTypeAsync(roomType.Id);
        }

        public async Task DeactivateRoomTypeAsync(int roomTypeId)
        {
            var roomType = await context.RoomTypes.FirstOrDefaultAsync(rt => rt.Id == roomTypeId)
                ?? throw new NotFoundException("Room type not found.");

            if (!roomType.IsActive)
                return;

            roomType.IsActive = false;

            await context.SaveChangesAsync();
        }

        public async Task DeactivateOwnerRoomTypeAsync(int ownerId, int roomTypeId)
        {
            var roomType = await context.RoomTypes.Include(rt => rt.Hotel).FirstOrDefaultAsync(rt => rt.Id == roomTypeId)
                ?? throw new NotFoundException("Room type not found.");

            if (roomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Room type not found.");

            if (!roomType.IsActive)
                return;

            roomType.IsActive = false;

            await context.SaveChangesAsync();
        }

        public async Task<RoomResponse> CreateRoomAsync(int roomTypeId, CreateRoomRequest req)
        {
            var roomTypeExists = await context.RoomTypes.AnyAsync(rt => rt.Id == roomTypeId);
            if (!roomTypeExists)
                throw new NotFoundException("Room type not found.");

            var room = new Room
            {
                RoomTypeId = roomTypeId,
                Number = req.Number.Trim(),
                IsActive = true
            };

            context.Rooms.Add(room);
            await SaveChangesHandlingRoomNumberConflictAsync();

            return ToRoomResponse(room);
        }

        public async Task<RoomResponse> CreateOwnerRoomAsync(int ownerId, int roomTypeId, CreateRoomRequest req)
        {
            var roomTypeExists = await context.RoomTypes.AnyAsync(rt => rt.Id == roomTypeId && rt.Hotel.OwnerId == ownerId);
            if (!roomTypeExists)
                throw new NotFoundException("Room type not found.");

            return await CreateRoomAsync(roomTypeId, req);
        }

        public async Task<RoomResponse> UpdateRoomAsync(int roomId, UpdateRoomRequest req)
        {
            var room = await context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId)
                ?? throw new NotFoundException("Room not found.");

            room.Number = req.Number.Trim();
            await SaveChangesHandlingRoomNumberConflictAsync();

            return ToRoomResponse(room);
        }

        public async Task<RoomResponse> UpdateOwnerRoomAsync(int ownerId, int roomId, UpdateRoomRequest req)
        {
            var room = await context.Rooms
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .FirstOrDefaultAsync(r => r.Id == roomId)
                ?? throw new NotFoundException("Room not found.");

            if (room.RoomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Room not found.");

            room.Number = req.Number.Trim();
            await SaveChangesHandlingRoomNumberConflictAsync();

            return ToRoomResponse(room);
        }

        public async Task DeactivateRoomAsync(int roomId)
        {
            var room = await context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId)
                ?? throw new NotFoundException("Room not found.");

            if (!room.IsActive)
                return;

            room.IsActive = false;

            await context.SaveChangesAsync();
        }

        public async Task DeactivateOwnerRoomAsync(int ownerId, int roomId)
        {
            var room = await context.Rooms.Include(r => r.RoomType).ThenInclude(rt => rt.Hotel).FirstOrDefaultAsync(r => r.Id == roomId)
                ?? throw new NotFoundException("Room not found.");

            if (room.RoomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Room not found.");

            if (!room.IsActive)
                return;

            room.IsActive = false;

            await context.SaveChangesAsync();
        }

        private async Task<ManagedHotelResponse> GetManagedHotelAsync(int hotelId)
        {
            return await context.Hotels
                .AsNoTracking()
                .Where(h => h.Id == hotelId)
                .Select(h => new ManagedHotelResponse
                {
                    Id = h.Id,
                    Name = h.Name,
                    Description = h.Description,
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
                        Capacity = rt.Capacity,
                        Price = rt.Price,
                        IsActive = rt.IsActive,
                        TotalRooms = rt.Rooms.Count(),
                        ActiveRooms = rt.Rooms.Count(r => r.IsActive)
                    }).ToList()
                })
                .FirstAsync();
        }

        private async Task<ManagedRoomTypeResponse> GetManagedRoomTypeAsync(int roomTypeId)
        {
            return await context.RoomTypes
                .AsNoTracking()
                .Where(rt => rt.Id == roomTypeId)
                .Select(rt => new ManagedRoomTypeResponse
                {
                    Id = rt.Id,
                    HotelId = rt.HotelId,
                    Name = rt.Name,
                    Description = rt.Description,
                    Capacity = rt.Capacity,
                    Price = rt.Price,
                    IsActive = rt.IsActive,
                    TotalRooms = rt.Rooms.Count(),
                    ActiveRooms = rt.Rooms.Count(r => r.IsActive)
                })
                .FirstAsync();
        }

        private static void ApplyHotelUpdate(Hotel hotel, UpdateHotelRequest req)
        {
            hotel.Name = req.Name.Trim();
            hotel.Description = req.Description;
            hotel.City = req.City.Trim();
            hotel.Address = req.Address.Trim();
        }

        private static void ApplyRoomTypeUpdate(RoomType roomType, UpdateRoomTypeRequest req)
        {
            roomType.Name = req.Name.Trim();
            roomType.Description = req.Description;
            roomType.Capacity = req.Capacity;
            roomType.Price = req.Price;
        }

        private async Task SaveChangesHandlingRoomNumberConflictAsync()
        {
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueRoomNumberViolation(ex))
            {
                throw new ConflictException("Room number already exists in this room type.");
            }
        }

        private static RoomResponse ToRoomResponse(Room r) => new()
        {
            Id = r.Id,
            RoomTypeId = r.RoomTypeId,
            Number = r.Number,
            IsActive = r.IsActive
        };
    }
}
