using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;
using WebAPI.ViewModels;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CinemasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CinemasController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Cinemas/Showtimes - Lấy các phim đang chiếu tại rạp cinemaId và lịch chiếu của chúng vào ngày date -> CinemasController
        [HttpGet("Showtimes")]
        public async Task<ActionResult<IEnumerable<ShowtimesInMovie>>> GetShowtimesOfCinema([FromQuery(Name = "cinema")] int cinemaId, [FromQuery(Name = "date")] DateTime date)
        {
            var showtimesInDb = await _context.Showtimes.Where(s => s.CinemaId == cinemaId && s.StartDate.Date == date.Date).Include(s => s.ScreenFormat).Include(s => s.Room).ThenInclude(r => r.RoomType).ToListAsync();
            if (showtimesInDb.Count == 0) return NotFound();
            // Id của những fim đang chiếu tại rạp
            List<int> movieIds = showtimesInDb.GroupBy(s => s.MovieId).Select(m => m.Key).ToList();
            List<ShowtimesInMovie> showtimesInMovies = new List<ShowtimesInMovie>();
            foreach (var id in movieIds)
            {
                // group lịch chiếu theo format
                List<ScreenFormat> formats = showtimesInDb.Where(s => s.MovieId == id).GroupBy(s => s.ScreenFormat).Select(f => f.Key).ToList();
                List<ShowtimeFormatVM> showtimeFormats = new List<ShowtimeFormatVM>();
                foreach (ScreenFormat format in formats)
                    showtimeFormats.Add(new ShowtimeFormatVM()
                    {
                        Name = format.Name,
                        Showtimes = showtimesInDb.Where(s => s.ScreenFormatId == format.Id && s.MovieId == id).Select(s => new ShowtimeVM() { Id = s.Id, StartDate = s.StartDate, Info = s.Room.RoomType == null ? null : s.Room.RoomType.Name }).ToList()
                    });
                // Thêm list các lịch chiếu theo movieId vào list showtime của rạp
                showtimesInMovies.Add(new ShowtimesInMovie() { MovieId = id, ShowtimeFormats = showtimeFormats });
            }
            return showtimesInMovies;
        }

        // GET: api/Cinemas - Lấy các rạp phim của chuỗi rạp -> manage-chains
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cinema>>> GetCinemas()
        {
            return await _context.Cinemas.ToListAsync();
        }
    }
    public class ShowtimesInMovie
    {
        public int MovieId { get; set; }
        public List<ShowtimeFormatVM> ShowtimeFormats { get; set; }
    }
}
