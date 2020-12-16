using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReviewsAndTickets_API.Helpers;
using MovieReviewsAndTickets_API.Models;
using MovieReviewsAndTickets_API.ViewModels;
using Newtonsoft.Json;

namespace MovieReviewsAndTickets_API.Controllers
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

        //Lấy chuỗi rạp và các rạp theo trong thành phố -> cinemas-modal
        [HttpGet("City/{city}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCinemas(int city)
        {
            return await _context.Cinemas.Where(cinema => cinema.CityId == city && !cinema.IsDeleted)
                                         .Include(cinema => cinema.CinemaChain)
                                         .Select(cinema => new { Id = cinema.Id, Address = cinema.Address, Logo = cinema.CinemaChain.Logo, Name = cinema.Name, CinemaChainId = cinema.CinemaChainId })
                                         .ToListAsync();
            //var lstCinemaChains = await _context.CinemaChains.ToListAsync();
            //return new { Chains = lstCinemaChains, Cinemas = lstCinemas };
        }
        //Lấy số rạp cho từng thành phố -> Location Modal
        [HttpGet("CountByCity")]
        public async Task<ActionResult<IEnumerable<CinemaCountsInCityVM>>> GetCitiesWithNumberOfCinemas()
        {
            List<CinemaCountsInCityVM> cinemaCountsInCities = new List<CinemaCountsInCityVM>();
            using (var httpClient = new HttpClient())
            {
                using (var response = await httpClient.GetAsync(ApiHelper.CinemaChainHost + "/api/Cities")) 
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var cities = JsonConvert.DeserializeObject<List<City>>(apiResponse);
                    foreach (var city in cities)
                    {
                        int counts = await _context.Cinemas.Where(c => c.CityId == city.Id && !c.IsDeleted).CountAsync();
                        cinemaCountsInCities.Add(new CinemaCountsInCityVM() { Id = city.Id, Name = city.Name, Counts = counts });
                    }
                }
            }
            return cinemaCountsInCities;
        }

        // Lấy chi tiết rạp phim -> cinema-details
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetCinema(int id)
        {
            var cinema = await _context.Cinemas.Include(c => c.CinemaChain).Where(c => c.Id == id && !c.IsDeleted).FirstOrDefaultAsync();
            if (cinema == null) return NotFound();
            return new { Id = cinema.Id, Name = cinema.Name, Address = cinema.Address, Logo = cinema.CinemaChain.Logo, CinemaChainId = cinema.CinemaChainId, Description = cinema.Description, CityId = cinema.CityId, CinemaChainName = cinema.CinemaChain.Name};
        }
        //Sửa thông tin rạp -> Manage cinema chains
        [HttpPut("{id}")]
        public async Task<ActionResult<Cinema>> PutCinema(int id, Cinema cinema)
        {
            if (id != cinema.Id)
            {
                return BadRequest();
            }

            _context.Entry(cinema).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CinemaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return cinema;
        }

        // POST: api/Cinemas - cập nhật những rạp phim mới từ CinemaChain
        [HttpPost]
        public async Task<ActionResult<Cinema>> PostCinema(List<Cinema> cinemas)
        {
            cinemas.ForEach(cinema => 
            {
                if (IsDeleted(cinema.Id)) _context.Entry(cinema).State = EntityState.Modified;
                else _context.Cinemas.Add(cinema);
            });

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Cinema>> DeleteCinema(int id)
        {
            var cinema = await _context.Cinemas.FindAsync(id);
            if (cinema == null)
            {
                return NotFound();
            }

            cinema.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CinemaExists(int id)
        {
            return _context.Cinemas.Any(e => e.Id == id && e.IsDeleted == false);
        }
        private bool IsDeleted(int id)
        {
            return _context.Cinemas.Any(e => e.Id == id && e.IsDeleted == true);
        }

        // GET: api/Cinemas/Showtimes - Lấy các phim đang chiếu tại rạp cinemaId và lịch chiếu của chúng vào ngày date -> cinema-details
        [HttpGet("Showtimes")]
        public async Task<ActionResult<IEnumerable<object>>> GetShowtimesOfCinema([FromQuery(Name = "cinema")] int cinemaId, [FromQuery(Name = "date")] DateTime date)
        {
            List<object> moviesWithShowtimes = new List<object>();
            using (var httpClient = new HttpClient())
            {
                using (var response = await httpClient.GetAsync(ApiHelper.CinemaChainHost + $"/api/Cinemas/Showtimes?cinema={cinemaId}&date={date}"))
                {
                    if (!response.IsSuccessStatusCode) return NoContent();
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var showtimesInMovies = JsonConvert.DeserializeObject<List<ShowtimesInMovie>>(apiResponse);
                    foreach (var movie in showtimesInMovies)
                    {
                        if (movie.ShowtimeFormats.Count == 0) continue;
                        var movieInDb = await _context.Movies.Where(m => m.Id == movie.MovieId).FirstOrDefaultAsync();
                        var movieWithShowtimes = new { Movie = movieInDb, ShowtimeFormats = movie.ShowtimeFormats };
                        moviesWithShowtimes.Add(movieWithShowtimes);
                    }
                }
            }
            return moviesWithShowtimes;
        }

        //Lấy các rạp thuộc chuỗi chainId -> cinema-chain 
        [HttpGet("Chain/{chainId}")]
        public async Task<ActionResult<object>> GetCinemasInChain(int chainId)
        {
            string cinemaChainName = await _context.CinemaChains.Where(c => c.Id == chainId && c.IsDeleted == false).Select(c => c.Name).FirstOrDefaultAsync();
            if (cinemaChainName == null) return NoContent();
            var lstCinema =  await _context.Cinemas.Where(cinema => cinema.CinemaChainId == chainId && !cinema.IsDeleted)
                                                   .Select(cinema => new Cinema() { Id = cinema.Id, Address = cinema.Address, Name = cinema.Name, CityId = cinema.CityId })
                                                   .ToListAsync();
            return new { CinemaChainName = cinemaChainName, Cinemas = lstCinema };
        }
    }
    public class ShowtimesInMovie
    {
        public int MovieId { get; set; }
        public List<ShowtimeFormatVM> ShowtimeFormats { get; set; }
    }
}
