using Microsoft.EntityFrameworkCore.Migrations;

namespace MovieReviewsAndTickets_API.Migrations
{
    public partial class AddMovieToOrder : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "Orders",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "d16313c9-70f6-4338-8fde-ef827e9c794d");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "953197ad-9185-46f1-b1c5-9e37c2675de8");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "9e531a1a-1ef8-4460-827f-7e8ac40fd231");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash" },
                values: new object[] { "30abbace-33fa-4f8b-bb6b-ad41cff6eceb", "AQAAAAEAACcQAAAAECD8Hr7p9vFDgHR0MCwzGi1rlzbkS3KZu1961bLcUmwojWrBVn7Kar5Ny9q71H3imQ==" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "Orders",
                type: "int",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "97a772b7-ee9a-4893-8d84-a2d215701c07");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "f9ea1730-e919-4bd4-a7ab-882bc49135eb");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "d7d5396b-4a28-45df-bc39-50156a13ff4c");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash" },
                values: new object[] { "d76111a7-13e3-4bf5-b20d-80afb5f3e48d", "AQAAAAEAACcQAAAAEJBAbCPEyh3wcaoN2XKrl6DmlsRBGHz/sXtqQsdGN5TTWJh56QQAFj9shiE+H7LUMg==" });
        }
    }
}
