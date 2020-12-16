using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using WebAPI.Models;
using WebAPI.ViewModels;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShowtimesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public static List<byte> IrRelevantSeats = new List<byte>(){ 7, 8, 9, 10 };
        byte available = 0, sold = 1;
        public ShowtimesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Showtimes - Lấy showtime của phim movie, ngày date tại rạp groupBy theo format
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShowtimeFormatVM>>> GetShowtimes([FromQuery(Name = "movie")] int movieId, [FromQuery(Name = "date")] DateTime date, [FromQuery(Name = "cinema")] int cinemaId)
        {
            var showtimesInDb = await _context.Showtimes.Where(s => s.CinemaId == cinemaId && s.MovieId == movieId && s.StartDate.Date == date.Date).Include(s => s.ScreenFormat).Include(s => s.Room).ThenInclude(r => r.RoomType).ToListAsync();
            if (showtimesInDb.Count == 0) return NotFound();
            List<ScreenFormat> formats = showtimesInDb.GroupBy(s => s.ScreenFormat).Select(f => f.Key).ToList();
            List<ShowtimeFormatVM> showtimeFormats = new List<ShowtimeFormatVM>();

            foreach (ScreenFormat format in formats)
                showtimeFormats.Add(new ShowtimeFormatVM()
                {
                    Name = format.Name,
                    Showtimes = showtimesInDb.Where(s => s.ScreenFormatId == format.Id).Select(s => new ShowtimeVM() { Id = s.Id, StartDate = s.StartDate, Info = s.Room.RoomType == null ? null : s.Room.RoomType.Name }).ToList()
                });

            return showtimeFormats;

        }

        // GET: api/Showtimes/id - Lấy chi tiết phòng của suất chiếu để user book vé -> booking/seats
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomVM>> GetRoomOfShowtime(int id)
        {
            //Tính giá min cho từng ghế trong suất chiếu đó
            var showtime = await _context.Showtimes
                                     .Where(s => s.Id == id)
                                     .Include(s => s.ScreenFormat)
                                     .Include(s => s.Cinema).ThenInclude(s => s.CinemaChain).ThenInclude(c => c.CheckoutInfo)
                                     .Include(s => s.Room).ThenInclude(r => r.RoomType).FirstOrDefaultAsync();
            if (showtime == null) return NotFound();
            // Giá min của seat là bằng giá suất chiếu + giá định dạng (2D, 3D, 4DX ...) nếu có + giá loại phòng (premium, sofa ... thường chỉ có CGV mới có) nếu có
            decimal minPrice = showtime.Price + (showtime.ScreenFormat != null ? showtime.ScreenFormat.ExtraFee : 0) + (showtime.Room.RoomType != null ? showtime.Room.RoomType.ExtraFee : 0);      
            var room = await _context.Rooms.Where(r => r.Id == id)
                                     .Include(r => r.Seats)
                                     .FirstOrDefaultAsync();
            if (room == null) return NotFound();
            // Lấy các ghế trong phòng chiếu
            var orderIds = await _context.Orders.Include(o => o.SeatsInOrders).Where(o => o.ShowtimeId == id).Select(o => o.Id).ToListAsync(); // Lấy các orders có showtimeId
            var paidSeatIds = await _context.SeatsInOrders.Where(s => orderIds.Contains(s.OrderId)).Select(s => s.SeatId).ToListAsync();       //Lấy ids các ghế đã paid của suất chiếu
            List<SeatVM> seats = room.Seats.Select(s => new SeatVM() { Id = s.Id, ColIndex = s.ColIndex, RowIndex = s.RowIndex, Code = s.Code, CoupleSeatId = s.CoupleSeatId, SeatTypeId = s.SeatTypeId, Status = paidSeatIds.Contains(s.Id)? sold: available }).ToList();           
            List<byte> seatTypesOfRoom = room.Seats.GroupBy(s => s.SeatTypeId).Where(g => IrRelevantSeats.IndexOf(g.Key) == -1).Select(g => g.Key).ToList();
           
            // Lấy extra fee của từng loại ghế theo chuỗi rạp của nó (Trong context phải sử dụng Contains thay cho IndexOf) 
            List<SeatTypeVM> seatTypeInChains = await _context.SeatTypeInChains
                                                              .Where(s => s.CinemaChainId == showtime.Cinema.CinemaChainId && seatTypesOfRoom.Contains(s.SeatTypeId))
                                                              .Include(s => s.SeatType)
                                                              .Select(s => new SeatTypeVM() { Id = s.SeatTypeId, Name = s.SeatType.Name, ExtraFee = s.ExtraFee })
                                                              .ToListAsync();

            return new RoomVM() { Id = room.Id, Rows = room.Rows, Cols = room.Cols, MinPrice = minPrice, Name = room.Name, Seats = seats, SeatTypes = seatTypeInChains, CheckoutKey = showtime.Cinema.CinemaChain.CheckoutInfo.PublicKey, NoOfMaxSeats = showtime.Cinema.CinemaChain.NoOfMaxSeats };
        }
        
    }
}
