using Microsoft.EntityFrameworkCore.Migrations;

namespace WebAPI.Migrations
{
    public partial class AddSeatTypeInChainToDB : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExtraFee",
                table: "SeatTypes");

            migrationBuilder.CreateTable(
                name: "SeatTypeInChains",
                columns: table => new
                {
                    SeatTypeId = table.Column<byte>(nullable: false),
                    CinemaChainId = table.Column<int>(nullable: false),
                    ExtraFee = table.Column<decimal>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeatTypeInChains", x => new { x.CinemaChainId, x.SeatTypeId });
                    table.ForeignKey(
                        name: "FK_SeatTypeInChains_CinemaChains_CinemaChainId",
                        column: x => x.CinemaChainId,
                        principalTable: "CinemaChains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SeatTypeInChains_SeatTypes_SeatTypeId",
                        column: x => x.SeatTypeId,
                        principalTable: "SeatTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SeatTypeInChains_SeatTypeId",
                table: "SeatTypeInChains",
                column: "SeatTypeId");

            migrationBuilder.Sql(@"
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (1, 1, 0)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (2, 1, 1000)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (3, 1, 5000)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (4, 1, 0)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (5, 1, 0)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (6, 1, 0)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (1, 2, 0)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (2, 2, 1000)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (3, 2, 5000)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (4, 2, 0)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (5, 2, 0)
                INSERT INTO [dbo].[SeatTypeInChains] ([SeatTypeId], [CinemaChainId], [ExtraFee]) VALUES (6, 2, 0)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SeatTypeInChains");

            migrationBuilder.AddColumn<decimal>(
                name: "ExtraFee",
                table: "SeatTypes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
