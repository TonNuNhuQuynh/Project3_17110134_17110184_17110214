using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace MovieReviewsAndTickets_API.Migrations
{
    public partial class UpdateImageInUsers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Users",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "varbinary(max)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "fa471c3c-18ed-4cb2-b1b5-29fcff592abc");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "3fc45d19-7f56-496c-8440-689a7063c12f");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "aa71c75d-bdae-40b6-bb55-1a26d798542d");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash" },
                values: new object[] { "5caeb66a-9d83-448b-9afc-e3549666b820", "AQAAAAEAACcQAAAAEMCcizRC4Fm3RjQFzLjP/RfU3kuC0RCX0rwt2ClChhNLhPtY2mTZl2MUrtWP77Tzxw==" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte[]>(
                name: "Image",
                table: "Users",
                type: "varbinary(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "70b25e00-9c00-4c4d-ab51-36de4682d391");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "93e93c93-5012-4d11-bb8d-f9e9931a8818");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "9df56587-136f-40fd-ac6c-1f82922dca2e");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash" },
                values: new object[] { "ec2243b1-5272-4a10-bb45-235212b755f5", "AQAAAAEAACcQAAAAELcYsbkuU+ZqfNsI+ywBqY60zG2mDMCHybpFArIj1gRhAZ2Kt2WDfO8uurA2/DZD9Q==" });
        }
    }
}
