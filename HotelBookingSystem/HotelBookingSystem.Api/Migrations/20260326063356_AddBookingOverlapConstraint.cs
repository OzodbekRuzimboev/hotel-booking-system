using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelBookingSystem.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingOverlapConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE EXTENSION IF NOT EXISTS btree_gist;
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "Bookings"
                ADD CONSTRAINT "EX_Bookings_RoomId_DateRange_NoOverlap"
                EXCLUDE USING gist (
                    "RoomId" WITH =,
                    daterange("CheckInDate", "CheckOutDate", '[)') WITH &&
                );
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Bookings"
                DROP CONSTRAINT IF EXISTS "EX_Bookings_RoomId_DateRange_NoOverlap";
            """);
        }
    }
}
