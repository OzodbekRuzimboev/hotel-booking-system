using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Entities;
using HotelBookingSystem.Api.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace HotelBookingSystem.Api.Services
{
    public class JwtTokenService(IOptions<JwtOptions> options)
    {
        private readonly JwtOptions _options = options.Value;
        private readonly JsonWebTokenHandler _tokenHandler = new();

        public string CreateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>()
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Name, user.Name),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new("role", user.Role.ToString())
            };

            var permissions = RolePermissions.Map[user.Role];
            foreach (var permission in permissions)
            {
                claims.Add(new("permission", permission));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = _options.Issuer,
                Audience = _options.Audience,
                Expires = DateTime.UtcNow.AddMinutes(_options.ExpirationInMinutes),
                SigningCredentials = credentials
            };

            return _tokenHandler.CreateToken(tokenDescriptor);
        }
    }
}
