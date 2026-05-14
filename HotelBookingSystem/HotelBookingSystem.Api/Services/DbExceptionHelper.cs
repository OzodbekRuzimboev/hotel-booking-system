using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HotelBookingSystem.Api.Services
{
    public static class DbExceptionHelper
    {
        public static bool IsUniqueRoomNumberViolation(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException pg &&
                   pg.SqlState == PostgresErrorCodes.UniqueViolation &&
                   pg.ConstraintName == "IX_Rooms_HotelId_Number";
        }

        public static bool IsBookingOverlapViolation(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException pg &&
                   pg.SqlState == PostgresErrorCodes.ExclusionViolation &&
                   pg.ConstraintName == "EX_Bookings_RoomId_DateRange_NoOverlap";
        }

        public static bool IsFavoriteHotelUniqueViolation(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException pg &&
                   pg.SqlState == PostgresErrorCodes.UniqueViolation &&
                   pg.ConstraintName == "IX_FavoriteHotels_UserId_HotelId";
        }
    }
}
