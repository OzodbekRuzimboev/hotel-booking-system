using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelBookingSystem.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixUserRoleValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Users"
                SET "Role" = CASE
                    WHEN "Role" = '0' THEN 'User'
                    WHEN "Role" = '1' THEN 'Admin'
                    ELSE "Role"
                END;
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Users"
                SET "Role" = CASE
                    WHEN "Role" = 'User' THEN '0'
                    WHEN "Role" = 'Admin' THEN '1'
                    ELSE "Role"
                END;
            """);
        }
    }
}
