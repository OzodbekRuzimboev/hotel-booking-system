using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelBookingSystem.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddImageGalleriesAndBookingContact : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string[]>(
                name: "ImageUrls",
                table: "RoomTypes",
                type: "text[]",
                nullable: false,
                defaultValueSql: "ARRAY[]::text[]");

            migrationBuilder.AddColumn<string[]>(
                name: "ImageUrls",
                table: "Hotels",
                type: "text[]",
                nullable: false,
                defaultValueSql: "ARRAY[]::text[]");

            migrationBuilder.AddColumn<string>(
                name: "GuestCountry",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestEmail",
                table: "Bookings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GuestPhoneNumber",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "Hotels"
                SET "ImageUrls" = ARRAY["ImageUrl"]
                WHERE "ImageUrl" IS NOT NULL AND btrim("ImageUrl") <> '';
                """);

            migrationBuilder.Sql("""
                UPDATE "RoomTypes"
                SET "ImageUrls" = ARRAY["ImageUrl"]
                WHERE "ImageUrl" IS NOT NULL AND btrim("ImageUrl") <> '';
                """);

            migrationBuilder.Sql("""
                UPDATE "Bookings" AS b
                SET "GuestEmail" = u."Email"
                FROM "Users" AS u
                WHERE b."UserId" = u."Id" AND b."GuestEmail" = '';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrls",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "ImageUrls",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "GuestCountry",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "GuestEmail",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "GuestPhoneNumber",
                table: "Bookings");
        }
    }
}
