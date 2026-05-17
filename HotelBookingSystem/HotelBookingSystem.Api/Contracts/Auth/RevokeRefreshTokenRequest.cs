using System.ComponentModel.DataAnnotations;

namespace HotelBookingSystem.Api.Contracts.Auth
{
    public class RevokeRefreshTokenRequest
    {
        [Required]
        [StringLength(512, MinimumLength = 20)]
        [RegularExpression(@".*\S.*", ErrorMessage = "Токен обновления не может быть пустым или состоять только из пробелов.")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
