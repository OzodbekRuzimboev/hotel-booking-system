using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelBookingSystem.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingStatusAndPartialOverlapConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Bookings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("""
                ALTER TABLE "Bookings"
                DROP CONSTRAINT IF EXISTS "EX_Bookings_RoomId_DateRange_NoOverlap";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "Bookings"
                ADD CONSTRAINT "EX_Bookings_RoomId_DateRange_NoOverlap"
                EXCLUDE USING gist (
                    "RoomId" WITH =,
                    daterange("CheckInDate", "CheckOutDate", '[)') WITH &&
                )
                WHERE ("Status" = 0);
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Bookings"
                DROP CONSTRAINT IF EXISTS "EX_Bookings_RoomId_DateRange_NoOverlap";
            """);

            migrationBuilder.Sql("""
                ALTER TABLE "Bookings"
                ADD CONSTRAINT "EX_Bookings_RoomId_DateRange_NoOverlap"
                EXCLUDE USING gist (
                    "RoomId" WITH =,
                    daterange("CheckInDate", "CheckOutDate", '[)') WITH &&
                );
            """);

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Bookings");
        }
    }
}
