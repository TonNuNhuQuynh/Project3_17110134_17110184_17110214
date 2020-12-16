using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace MovieReviewsAndTickets_API.Migrations
{
    public partial class UpdateMovies : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccountId",
                table: "Movies",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "Movies",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "ba1af546-9902-42cc-8ead-21676594d6b3");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "25b537de-3c3b-452c-b8e5-a7b483326e64");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "93cf1e8d-1c96-41f8-8031-42da7e458645");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash" },
                values: new object[] { "eea5aa21-20c2-4667-9434-4bb61cd69ca8", "AQAAAAEAACcQAAAAEOHKn+izbL8lgwv6R8iTEPNTUEYce6QqpSgIkHBcuHv1W4LZQPrjhF4u5sciNNdcOg==" });

            migrationBuilder.CreateIndex(
                name: "IX_Movies_AccountId",
                table: "Movies",
                column: "AccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_Movies_AspNetUsers_AccountId",
                table: "Movies",
                column: "AccountId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Movies_AspNetUsers_AccountId",
                table: "Movies");

            migrationBuilder.DropIndex(
                name: "IX_Movies_AccountId",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "Movies");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "aa43bed4-f60e-492f-b40b-cd12d1fe9fb3");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "9df4c80d-8f51-4904-8475-7803062cc969");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "51fe38b1-5533-436d-88b3-17cda63a65e3");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash" },
                values: new object[] { "3fd9c1e2-abd0-4f6d-bf89-8f4c395f99f3", "AQAAAAEAACcQAAAAEBld1H7Li5nhAlvsSXnPbj3nmHQmS2daCQf6Z4nFmu/WLb9sz4H79Is9fB9lL/hAlQ==" });
        }
    }
}
