using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelBookingSystem.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHotelOwner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Hotels",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "OwnerId",
                table: "Hotels",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Hotels_OwnerId",
                table: "Hotels",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Hotels_Users_OwnerId",
                table: "Hotels",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hotels_Users_OwnerId",
                table: "Hotels");

            migrationBuilder.DropIndex(
                name: "IX_Hotels_OwnerId",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Hotels");
        }
    }
}
