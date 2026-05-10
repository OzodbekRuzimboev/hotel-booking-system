using HotelBookingSystem.Api.Contracts.Reviews;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingSystem.Api.Services.Hotels
{
    public class ReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ReviewResponse>> GetHotelReviewsAsync(int hotelId)
        {
            var hotelExists = await _context.Hotels.AnyAsync(h => h.Id == hotelId && h.IsActive);
            if (!hotelExists)
                throw new NotFoundException("Hotel not found.");

            return await _context.Reviews
                .AsNoTracking()
                .Where(r => r.HotelId == hotelId)
                .OrderByDescending(r => r.UpdatedAt ?? r.CreatedAt)
                .Select(ToReviewResponse())
                .ToListAsync();
        }

        public async Task<ReviewResponse> CreateOrUpdateReviewAsync(int userId, int hotelId, CreateReviewRequest req)
        {
            var roomType = await _context.RoomTypes
                .AsNoTracking()
                .Where(rt => rt.Id == req.RoomTypeId && rt.HotelId == hotelId && rt.IsActive && rt.Hotel.IsActive)
                .Select(rt => new { rt.Id })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Room type not found for this hotel.");

            var existing = await _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.RoomTypeId == roomType.Id);

            if (existing is null)
            {
                var review = new Review
                {
                    UserId = userId,
                    HotelId = hotelId,
                    RoomTypeId = roomType.Id,
                    Rating = req.Rating,
                    Comment = NormalizeOptionalText(req.Comment),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();
                return await GetReviewAsync(review.Id);
            }

            existing.Rating = req.Rating;
            existing.Comment = NormalizeOptionalText(req.Comment);
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetReviewAsync(existing.Id);
        }

        public async Task<ReviewResponse> UpdateReviewAsync(int userId, int hotelId, int reviewId, CreateReviewRequest req)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId && r.HotelId == hotelId)
                ?? throw new NotFoundException("Review not found.");

            var roomTypeExists = await _context.RoomTypes
                .AsNoTracking()
                .AnyAsync(rt => rt.Id == req.RoomTypeId && rt.HotelId == hotelId && rt.IsActive && rt.Hotel.IsActive);

            if (!roomTypeExists)
                throw new NotFoundException("Room type not found for this hotel.");

            review.RoomTypeId = req.RoomTypeId;
            review.Rating = req.Rating;
            review.Comment = NormalizeOptionalText(req.Comment);
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetReviewAsync(review.Id);
        }

        public async Task DeleteReviewAsync(int userId, int hotelId, int reviewId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId && r.HotelId == hotelId)
                ?? throw new NotFoundException("Review not found.");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }

        private async Task<ReviewResponse> GetReviewAsync(int reviewId)
        {
            return await _context.Reviews
                .AsNoTracking()
                .Where(r => r.Id == reviewId)
                .Select(ToReviewResponse())
                .FirstAsync();
        }

        private static System.Linq.Expressions.Expression<Func<Review, ReviewResponse>> ToReviewResponse() => r => new ReviewResponse
        {
            Id = r.Id,
            HotelId = r.HotelId,
            RoomTypeId = r.RoomTypeId,
            RoomTypeName = r.RoomType.Name,
            UserId = r.UserId,
            UserName = r.User.Name,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        };

        private static string? NormalizeOptionalText(string? value)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
        }
    }
}
