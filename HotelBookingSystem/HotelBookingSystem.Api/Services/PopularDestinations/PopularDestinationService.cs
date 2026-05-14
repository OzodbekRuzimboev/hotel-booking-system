using HotelBookingSystem.Api.Contracts.Admin;
using HotelBookingSystem.Api.Contracts.PopularDestinations;
using HotelBookingSystem.Api.Data;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace HotelBookingSystem.Api.Services.PopularDestinations
{
    public class PopularDestinationService
    {
        private readonly AppDbContext _context;

        public PopularDestinationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<PopularDestinationResponse>> GetPublicDestinationsAsync()
        {
            return await _context.PopularDestinations
                .AsNoTracking()
                .Where(destination => destination.IsActive)
                .OrderBy(destination => destination.SortOrder)
                .ThenBy(destination => destination.City)
                .Select(Projection())
                .ToListAsync();
        }

        public async Task<List<PopularDestinationResponse>> GetManagedDestinationsAsync()
        {
            return await _context.PopularDestinations
                .AsNoTracking()
                .OrderBy(destination => destination.SortOrder)
                .ThenBy(destination => destination.City)
                .Select(Projection())
                .ToListAsync();
        }

        public async Task<PopularDestinationResponse> CreateDestinationAsync(PopularDestinationRequest req)
        {
            var destination = new PopularDestination
            {
                City = NormalizeRequiredText(req.City),
                Country = NormalizeRequiredText(req.Country),
                ImageUrl = NormalizeRequiredText(req.ImageUrl),
                SortOrder = req.SortOrder,
                IsActive = req.IsActive
            };

            _context.PopularDestinations.Add(destination);
            await _context.SaveChangesAsync();

            return await GetDestinationAsync(destination.Id);
        }

        public async Task<PopularDestinationResponse> UpdateDestinationAsync(int destinationId, PopularDestinationRequest req)
        {
            var destination = await _context.PopularDestinations.FirstOrDefaultAsync(d => d.Id == destinationId)
                ?? throw new NotFoundException("Popular destination not found.");

            destination.City = NormalizeRequiredText(req.City);
            destination.Country = NormalizeRequiredText(req.Country);
            destination.ImageUrl = NormalizeRequiredText(req.ImageUrl);
            destination.SortOrder = req.SortOrder;
            destination.IsActive = req.IsActive;

            await _context.SaveChangesAsync();

            return await GetDestinationAsync(destination.Id);
        }

        public async Task DeleteDestinationAsync(int destinationId)
        {
            var destination = await _context.PopularDestinations.FirstOrDefaultAsync(d => d.Id == destinationId)
                ?? throw new NotFoundException("Popular destination not found.");

            _context.PopularDestinations.Remove(destination);
            await _context.SaveChangesAsync();
        }

        private async Task<PopularDestinationResponse> GetDestinationAsync(int destinationId)
        {
            return await _context.PopularDestinations
                .AsNoTracking()
                .Where(destination => destination.Id == destinationId)
                .Select(Projection())
                .FirstAsync();
        }

        private static string NormalizeRequiredText(string value)
        {
            var normalized = value.Trim();

            if (normalized.Length == 0)
                throw new ValidationException("Popular destination fields cannot be empty.");

            return normalized;
        }

        private static Expression<Func<PopularDestination, PopularDestinationResponse>> Projection() =>
            destination => new PopularDestinationResponse
            {
                Id = destination.Id,
                City = destination.City,
                Country = destination.Country,
                ImageUrl = destination.ImageUrl,
                SortOrder = destination.SortOrder,
                IsActive = destination.IsActive
            };
    }
}
