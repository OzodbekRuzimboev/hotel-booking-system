using HotelBookingSystem.Api.Contracts;
using HotelBookingSystem.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HotelsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetHotels()
        {
            var hotels = _context.Hotels.Select(h => new HotelResponse
            {
                Id = h.Id,
                Name = h.Name,
                City = h.City,
                Address = h.Address
            }).ToList();

            return Ok(hotels);
        }

        [HttpGet("{id}")]
        public IActionResult GetHotelById(int id)
        {
            var hotel = _context.Hotels.Include(h => h.Rooms).SingleOrDefault(h => h.Id == id);

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
    }
}
