using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
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
    public class CinemaChainsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CinemaChainsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CinemaChains - lấy chuỗi rạp -> manage-cinema-chains
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CinemaChain>>> GetCinemaChains()
        {
            var chains = await _context.CinemaChains.Where(c => c.IsDeleted == false).Include(c => c.Cinemas).ToListAsync();
            chains.ForEach(chain => {
                chain.Cinemas = chain.Cinemas.Where(c => !c.IsDeleted).ToList();
            });
            return chains;
        }

        // GET: api/CinemaChains/5 - Lấy các chuỗi rạp trong thành phố cityId có chiếu phim movieId vào ngày date  -> showtimes
        [HttpGet("CheckShowtimes")]
        public async Task<ActionResult<IEnumerable<CinemaChainVM>>> GetCinemasInCinemaChainsByCity([FromQuery(Name = "movie")] int movieId, [FromQuery(Name = "date")] DateTime date, [FromQuery(Name = "city")] int cityId)
        {
            List<CinemaChainVM> cinemaChains = new List<CinemaChainVM>();
            using (var httpClient = new HttpClient())
            {
                using (var response = await httpClient.GetAsync(ApiHelper.CinemaChainHost + $"/api/CinemaChains/CheckShowtimes?movie={movieId}&city={cityId}&date={date}"))
                {
                    if (!response.IsSuccessStatusCode) return NoContent();
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var chains = JsonConvert.DeserializeObject<List<CinemaChainResponse>>(apiResponse);
                    foreach (var chain in chains)
                    {
                        if (chain.CinemaIds.Count == 0) continue;
                        var chainInDB = await _context.CinemaChains.Where(c => c.Id == chain.CinemaChainId && c.IsDeleted == false).Include(c => c.Cinemas).FirstOrDefaultAsync();
                        if (chainInDB == null) continue;
                        CinemaChainVM chainVM = new CinemaChainVM() { Id = chainInDB.Id, Name = chainInDB.Name, NoOfMaxSeats = chainInDB.NoOfMaxSeats, Logo = chainInDB.Logo, Cinemas = chainInDB.Cinemas.Where(c => chain.CinemaIds.IndexOf(c.Id) > -1 && c.IsDeleted == false).Select(c => new CinemaVM { Id = c.Id, Address = c.Address, Name = c.Name, ShowtimeFormats = null }).ToList() };
                        cinemaChains.Add(chainVM);
                    }
                }
            }
            return cinemaChains;
        }

        // POST: api/CinemaChains - Thêm chuỗi rạp -> manage-cinema-chains
        [HttpPost]
        public async Task<ActionResult<CinemaChain>> PostCinemaChain(CinemaChain cinemaChain)
        {
            if (CinemaChainExists(cinemaChain.Id)) return Conflict();
            else if (IsDeleted(cinemaChain.Id))
            {
                _context.Entry(cinemaChain).State = EntityState.Modified;
                var cinemasInDB = _context.Cinemas.Where(c => c.CinemaChainId == cinemaChain.Id).Select(c => c.Id).ToList();
                cinemaChain.Cinemas.ToList().ForEach(cinema =>
                {
                    if (cinemasInDB.Contains(cinema.Id)) _context.Entry(cinema).State = EntityState.Modified;
                    else _context.Cinemas.Add(cinema);
                });
                
            }
            else _context.CinemaChains.Add(cinemaChain);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/CinemaChains/5 - Xóa chuỗi rạp -> manage-cinema-chains
        [HttpDelete("{id}")]
        public async Task<ActionResult<CinemaChain>> DeleteCinemaChain(int id)
        {
            var cinemas = await _context.Cinemas.Where(c => c.CinemaChainId == id).ToListAsync();
            cinemas.ForEach(cinema => cinema.IsDeleted = true);
            var cinemaChain = await _context.CinemaChains.FindAsync(id);
            if (cinemaChain == null) return NotFound();
            cinemaChain.IsDeleted = true;
            await _context.SaveChangesAsync();
            return cinemaChain;
        }

        private bool CinemaChainExists(int id)
        {
            return _context.CinemaChains.Any(e => e.Id == id && e.IsDeleted == false);
        }
        private bool IsDeleted(int id)
        {
            return _context.CinemaChains.Any(e => e.Id == id && e.IsDeleted == true);
        }
        private class CinemaChainResponse
        {
            public int CinemaChainId { get; set; }
            public List<int> CinemaIds { get; set; }
        }
    }
}
