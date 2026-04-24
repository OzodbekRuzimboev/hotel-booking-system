using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.Hotels;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;

namespace HotelBookingSystem.Api.Services.Admin
{
    public class AdminService(AppDbContext context)
    {
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

            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();

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
    }
}
