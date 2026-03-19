using HotelBookingSystem.Api.Exceptions;
using System.Security.Claims;

namespace HotelBookingSystem.Api.Extentions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(value, out var userId))
                throw new UnauthorizedException("Invalid token.");

            return userId;
        }
    }
}
