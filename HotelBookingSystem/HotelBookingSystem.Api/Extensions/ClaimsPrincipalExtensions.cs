using HotelBookingSystem.Api.Exceptions;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;

namespace HotelBookingSystem.Api.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (!int.TryParse(value, out var userId))
                throw new UnauthorizedException("Invalid token.");

            return userId;
        }
    }
}
