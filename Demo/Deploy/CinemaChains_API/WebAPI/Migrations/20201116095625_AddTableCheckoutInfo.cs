using Microsoft.EntityFrameworkCore.Migrations;

namespace WebAPI.Migrations
{
    public partial class AddTableCheckoutInfo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Seats");

            migrationBuilder.CreateTable(
                name: "CheckoutInfos",
                columns: table => new
                {
                    CinemaChainId = table.Column<int>(nullable: false),
                    PublicKey = table.Column<string>(nullable: false),
                    PrivateKey = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckoutInfos", x => new { x.CinemaChainId, x.PublicKey, x.PrivateKey });
                    table.ForeignKey(
                        name: "FK_CheckoutInfos_CinemaChains_CinemaChainId",
                        column: x => x.CinemaChainId,
                        principalTable: "CinemaChains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CheckoutInfos_CinemaChainId",
                table: "CheckoutInfos",
                column: "CinemaChainId",
                unique: true);

            migrationBuilder.Sql(@"
                INSERT INTO [dbo].[CheckoutInfos] ([CinemaChainId], [PublicKey], [PrivateKey]) VALUES (1, N'pk_test_51HlpUZBPY5M8bdT0i3l7wKq2fVdz0VCGJ4umOHswTRkaILCpfyCLnRQMEreU6tdEBo8ap0ObbkkM3AWP1nzFHyDC00cSGCyHSo', N'sk_test_51HlpUZBPY5M8bdT0GyFAwmukaKyJb7OCml5Fodx9sygudZuJWomhNEVHQLKenhMCkZAWSn6Ut78nYeiE3WkBwWZq00cjjNO4kw')
                INSERT INTO [dbo].[CheckoutInfos] ([CinemaChainId], [PublicKey], [PrivateKey]) VALUES (2, N'pk_test_akatYEGLLvx0QseQhLLAEbjJ004yA8603Q', N'sk_test_bFesAIYDFEr7RVlA0BC9PAWe00rnO78sdD')");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CheckoutInfos");

            migrationBuilder.AddColumn<byte>(
                name: "Status",
                table: "Seats",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);
        }
    }
}
