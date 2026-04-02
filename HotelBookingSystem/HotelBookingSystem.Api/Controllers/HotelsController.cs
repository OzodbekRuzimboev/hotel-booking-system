using HotelBookingSystem.Api.Contracts.Hotels;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HotelService _service;

        public HotelsController(AppDbContext context, HotelService service)
        {
            _context = context;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetHotels()
        {
            var hotels = await _context.Hotels.AsNoTracking().Select(h => new HotelResponse
            {
                Id = h.Id,
                Name = h.Name,
                City = h.City,
                Address = h.Address
            }).ToListAsync();

            return Ok(hotels);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetHotelById(int id)
        {
            var hotel = await _context.Hotels.AsNoTracking().Include(h => h.Rooms).FirstOrDefaultAsync(h => h.Id == id);

            if (hotel == null)
                return NotFound();

            var response = new HotelDetailsResponse
            {
                Id = hotel.Id,
                Name = hotel.Name,
                City = hotel.City,
                Address = hotel.Address,
                Rooms = hotel.Rooms.Select(r => new RoomResponse
                {
                    Id = r.Id,
                    Name = r.Name,
                    Capacity = r.Capacity,
                    Price = r.Price
                }).ToList()
            };

            return Ok(response);
        }

        [HttpGet("search")]
        public async Task<IActionResult> GetAvailableHotels(string city, DateOnly checkInDate, DateOnly checkOutDate)
        {
            var hotels = await _service.GetAvailableHotelsAsync(city, checkInDate, checkOutDate);

            return Ok(hotels);
        }
    }
}
