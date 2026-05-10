using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelBookingSystem.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAmenitiesAndSearchFilters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string[]>(
                name: "Amenities",
                table: "RoomTypes",
                type: "text[]",
                nullable: false,
                defaultValueSql: "ARRAY[]::text[]");

            migrationBuilder.AddColumn<string[]>(
                name: "MealOptions",
                table: "RoomTypes",
                type: "text[]",
                nullable: false,
                defaultValueSql: "ARRAY[]::text[]");

            migrationBuilder.AddColumn<string[]>(
                name: "Amenities",
                table: "Hotels",
                type: "text[]",
                nullable: false,
                defaultValueSql: "ARRAY[]::text[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Amenities",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "MealOptions",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "Amenities",
                table: "Hotels");
        }
    }
}
