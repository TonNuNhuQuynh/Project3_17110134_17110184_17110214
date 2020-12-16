using Microsoft.EntityFrameworkCore.Migrations;

namespace MovieReviewsAndTickets_API.Migrations
{
    public partial class FirstSeed : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Hành động')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Phiêu lưu')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Hoạt hình')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Hài')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Tội phạm')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Tài liệu')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Gia đình')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Tình cảm')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Kinh dị')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Khoa học viễn tưởng')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Chính kịch')
                INSERT INTO [dbo].[Genres] ([Name]) VALUES (N'Lịch sử')");

            migrationBuilder.Sql(@"
                INSERT INTO [dbo].[Languages] ([Name]) VALUES (N'Tiếng Anh')
                INSERT INTO [dbo].[Languages] ([Name]) VALUES (N'Tiếng Việt')
                INSERT INTO [dbo].[Languages] ([Name]) VALUES (N'Tiếng Trung')
                INSERT INTO [dbo].[Languages] ([Name]) VALUES (N'Tiếng Hàn')");

            migrationBuilder.Sql(@"
                INSERT INTO [dbo].[MovieStatuses] ([Name]) VALUES (N'Đang chiếu')
                INSERT INTO [dbo].[MovieStatuses] ([Name]) VALUES (N'Sắp chiếu')
                INSERT INTO [dbo].[MovieStatuses] ([Name]) VALUES (N'Chưa có lịch chiếu')");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            
        }
    }
}
