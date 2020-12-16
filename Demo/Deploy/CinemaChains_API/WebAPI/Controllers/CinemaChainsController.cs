using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CinemaChainsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CinemaChainsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CinemaChains - Lấy danh sách các chuỗi rạp -> manage-cinema-chains
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CinemaChain>>> GetCinemaChains()
        {
            return await _context.CinemaChains.Include(c => c.Cinemas).ToListAsync();
        }

        // GET: api/CinemaChains/CheckShowtimes - lấy các chuỗi rạp và rạp trong tp cityId thuộc chuỗi có chiếu phim cần tìm trong ngày date
        [HttpGet("CheckShowtimes")]
        public async Task<ActionResult<IEnumerable<object>>> ShowtimesOfCinemaChain([FromQuery(Name = "movie")] int movieId, [FromQuery(Name = "date")] DateTime date, [FromQuery(Name = "city")] int cityId)
        {
            //Kiểm tra xem có chuỗi rạp nào đang chiếu phim không
            var movieInTheater = await _context.MoviesInCinemaChains.Where(m => m.MovieId == movieId && m.Status == 0).ToListAsync();
            if (movieInTheater == null) return NotFound();
            else
            {
                List<object> cinemasInChains = new List<object>();
                var cinemaChainIds = movieInTheater.GroupBy(m => m.CinemaChainId).Select(chain => chain.Key).ToList();
                foreach (int chainId in cinemaChainIds)
                {
                    //Lấy các rạp của chuỗi phim có chiếu fim movieId
                    var cinemas = _context.Cinemas.Where(cinema => cinema.CinemaChainId == chainId && cinema.CityId == cityId)
                                          .Include(cinema => cinema.Showtimes).ToList();
                    List<int> cinemaIds = cinemas.Where(c => c.Showtimes != null && c.Showtimes.Where(s => s.StartDate.Date == date.Date && s.MovieId == movieId).ToList().Count > 0).Select(c => c.Id).ToList();
                    cinemasInChains.Add(new { CinemaChainId = chainId, CinemaIds = cinemaIds });
                }
                return cinemasInChains;
            }
        }

        // PUT: api/CinemaChains/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCinemaChain(int id, CinemaChain cinemaChain)
        {
            if (id != cinemaChain.Id)
            {
                return BadRequest();
            }

            _context.Entry(cinemaChain).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CinemaChainExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/CinemaChains
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<CinemaChain>> PostCinemaChain(CinemaChain cinemaChain)
        {
            _context.CinemaChains.Add(cinemaChain);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCinemaChain", new { id = cinemaChain.Id }, cinemaChain);
        }

        // DELETE: api/CinemaChains/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<CinemaChain>> DeleteCinemaChain(int id)
        {
            var cinemaChain = await _context.CinemaChains.FindAsync(id);
            if (cinemaChain == null)
            {
                return NotFound();
            }

            _context.CinemaChains.Remove(cinemaChain);
            await _context.SaveChangesAsync();

            return cinemaChain;
        }

        private bool CinemaChainExists(int id)
        {
            return _context.CinemaChains.Any(e => e.Id == id);
        }
    }
    
}
