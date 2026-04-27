using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Hotels;
using HotelBookingSystem.Api.Contracts.Management;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Enums;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services.Hotels
{
    public class HotelManagementService
    {
        private readonly AppDbContext _context;
        public HotelManagementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<HotelResponse>> GetHotelsAsync()
        {
            var hotels = await _context.Hotels
                .AsNoTracking()
                .Select(h => new HotelResponse
                {
                    Id = h.Id,
                    Name = h.Name,
                    Description = h.Description,
                    City = h.City,
                    Address = h.Address,
                    IsActive = h.IsActive,
                    OwnerId = h.OwnerId
                })
                .ToListAsync();

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
                    IsActive = h.IsActive,
                    OwnerId = h.OwnerId,
                    RoomTypes = h.RoomTypes
                        .Select(rt => new RoomTypeResponse
                        {
                            Id = rt.Id,
                            Name = rt.Name,
                            Description = rt.Description,
                            Capacity = rt.Capacity,
                            Price = rt.Price,
                            TotalCount = rt.Rooms.Count
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Hotel not found.");

            return hotel;
        }

        public async Task<HotelDetailsResponse> CreateHotelAsync(CreateHotelRequest req)
        {
            var hotel = new Hotel
            {
                Name = req.Name,
                Description = req.Description,
                City = req.City,
                Address = req.Address,
                RoomTypes = req.RoomTypes.Select(rt => new RoomType
                {
                    Name = rt.Name,
                    Description = rt.Description,
                    Capacity = rt.Capacity,
                    Price = rt.Price,
                    Rooms = rt.Rooms.Select(r => new Room { Number = r.Number }).ToList()
                }).ToList()
            };

            _context.Hotels.Add(hotel);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueRoomNumberViolation(ex))
            {
                throw new ConflictException("Room number already exists in this room type.");
            }

            var hotelResponse = new HotelDetailsResponse
            {
                Id = hotel.Id,
                Name = hotel.Name,
                Description = hotel.Description,
                City = hotel.City,
                Address = hotel.Address,
                RoomTypes = hotel.RoomTypes.Select(rt => new RoomTypeResponse
                {
                    Id = rt.Id,
                    Name = rt.Name,
                    Description = rt.Description,
                    Capacity = rt.Capacity,
                    Price = rt.Price,
                    TotalCount = rt.Rooms.Count
                }).ToList()
            };

            return hotelResponse;
        }

        public async Task<ManagedHotelResponse> UpdateHotelAsync(int hotelId, UpdateHotelRequest req)
        {
            var hotel = await _context.Hotels
                .Include(h => h.RoomTypes)
                .ThenInclude(rt => rt.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId)
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

        public async Task<ManagedHotelResponse> UpdateOwnerHotelAsync(int ownerId, int hotelId, UpdateHotelRequest req)
        {
            var hotel = await _context.Hotels
                .Include(h => h.RoomTypes)
                .ThenInclude(rt => rt.Rooms)
                .FirstOrDefaultAsync(h => h.Id == hotelId && h.OwnerId == ownerId)
                ?? throw new NotFoundException("Hotel not found.");

            ApplyHotelChanges(hotel, req);
            await _context.SaveChangesAsync();

            return await GetManagedHotelAsync(hotel.Id);
        }



        private static void ApplyHotelChanges(Hotel hotel, UpdateHotelRequest req)
        {
            hotel.Name = req.Name.Trim();
            hotel.Description = req.Description;
            hotel.City = req.City.Trim();
            hotel.Address = req.Address.Trim();
        }

        private async Task<ManagedHotelResponse> GetManagedHotelAsync(int hotelId)
        {
            return await _context.Hotels
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
    }
}
