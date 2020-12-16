using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieReviewsAndTickets_API.Models;

namespace MovieReviewsAndTickets_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieLikesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MovieLikesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/MovieLikes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovieLike>>> GetMovieLikes()
        {
            return await _context.MovieLikes.ToListAsync();
        }

        // GET: api/MovieLikes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MovieLike>> GetMovieLike(int id)
        {
            var movieLike = await _context.MovieLikes.FindAsync(id);

            if (movieLike == null)
            {
                return NotFound();
            }

            return movieLike;
        }

        // POST: api/MovieLikes
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<MovieLike>> PostMovieLike(MovieLike movieLike)
        {
            movieLike.Date = DateTime.Now;
            _context.MovieLikes.Add(movieLike);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (MovieLikeExists(movieLike.AccountId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return movieLike;
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovieLike(int id)
        {
            var movieLike = await _context.MovieLikes.Where(m => m.MovieId == id).FirstOrDefaultAsync();

            if (movieLike == null)
            {
                return NotFound();
            }

            _context.MovieLikes.Remove(movieLike);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MovieLikeExists(int id)
        {
            return _context.MovieLikes.Any(e => e.AccountId == id);
        }
    }
}
