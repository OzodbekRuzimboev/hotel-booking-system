using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services.Rooms
{
    public class RoomManagementService
    {
        private readonly AppDbContext _context;

        public RoomManagementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RoomResponse> CreateRoomAsync(int roomTypeId, CreateRoomRequest req)
        {
            var roomType = await _context.RoomTypes
                .Where(rt => rt.Id == roomTypeId)
                .Select(rt => new
                {
                    rt.Id,
                    rt.HotelId
                })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Тип номера не найден.");

            var roomNumber = req.Number.Trim();

            await EnsureRoomNumberUniqueInHotelAsync(roomType.HotelId, roomNumber);

            var room = new Room
            {
                HotelId = roomType.HotelId,
                RoomTypeId = roomType.Id,
                Number = roomNumber,
                IsActive = true
            };

            _context.Rooms.Add(room);
            await SaveChangesHandlingRoomNumberConflictAsync();

            return ToRoomResponse(room);
        }

        public async Task<RoomResponse> UpdateRoomAsync(int roomId, UpdateRoomRequest req)
        {
            var room = await _context.Rooms
                .FirstOrDefaultAsync(r => r.Id == roomId)
                ?? throw new NotFoundException("Номер не найден.");

            var roomNumber = req.Number.Trim();

            await EnsureRoomNumberUniqueInHotelAsync(
                room.HotelId,
                roomNumber,
                room.Id);

            room.Number = roomNumber;
            await SaveChangesHandlingRoomNumberConflictAsync();

            return ToRoomResponse(room);
        }

        public async Task DeactivateRoomAsync(int roomId)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId)
                ?? throw new NotFoundException("Номер не найден.");

            if (!room.IsActive)
                return;

            room.IsActive = false;

            await _context.SaveChangesAsync();
        }



        public async Task<RoomResponse> CreateOwnerRoomAsync(int ownerId, int roomTypeId, CreateRoomRequest req)
        {
            var roomType = await _context.RoomTypes
                .Where(rt => rt.Id == roomTypeId && rt.Hotel.OwnerId == ownerId)
                .Select(rt => new
                {
                    rt.Id,
                    rt.HotelId
                })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Тип номера не найден.");

            var roomNumber = req.Number.Trim();

            await EnsureRoomNumberUniqueInHotelAsync(roomType.HotelId, roomNumber);

            var room = new Room
            {
                HotelId = roomType.HotelId,
                RoomTypeId = roomType.Id,
                Number = roomNumber,
                IsActive = true
            };

            _context.Rooms.Add(room);
            await SaveChangesHandlingRoomNumberConflictAsync();

            return ToRoomResponse(room);
        }

        public async Task<RoomResponse> UpdateOwnerRoomAsync(int ownerId, int roomId, UpdateRoomRequest req)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .FirstOrDefaultAsync(r => r.Id == roomId)
                ?? throw new NotFoundException("Номер не найден.");

            if (room.RoomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Номер не найден.");

            var roomNumber = req.Number.Trim();

            await EnsureRoomNumberUniqueInHotelAsync(
                room.HotelId,
                roomNumber,
                room.Id);

            room.Number = roomNumber;
            await SaveChangesHandlingRoomNumberConflictAsync();

            return ToRoomResponse(room);
        }

        public async Task DeactivateOwnerRoomAsync(int ownerId, int roomId)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .FirstOrDefaultAsync(r => r.Id == roomId)
                ?? throw new NotFoundException("Номер не найден.");

            if (room.RoomType.Hotel.OwnerId != ownerId)
                throw new NotFoundException("Номер не найден.");

            if (!room.IsActive)
                return;

            room.IsActive = false;

            await _context.SaveChangesAsync();
        }


        private async Task EnsureRoomNumberUniqueInHotelAsync(int hotelId, string roomNumber, int? excludeRoomId = null)
        {
            var exists = await _context.Rooms.AnyAsync(r =>
                r.HotelId == hotelId &&
                r.Number == roomNumber &&
                (!excludeRoomId.HasValue || r.Id != excludeRoomId.Value));

            if (exists)
                throw new ConflictException("Такой номер комнаты уже есть в этом отеле.");
        }

        private async Task SaveChangesHandlingRoomNumberConflictAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueRoomNumberViolation(ex))
            {
                throw new ConflictException("Такой номер комнаты уже существует.");
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
