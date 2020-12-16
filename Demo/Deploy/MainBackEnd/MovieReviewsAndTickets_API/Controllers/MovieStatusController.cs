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
    [Route("api/MovieStatus")]
    [ApiController]
    public class MovieStatusController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MovieStatusController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/MovieStatus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovieStatus>>> GetMovieStatuses()
        {
            return await _context.MovieStatuses.ToListAsync();
        }

        // GET: api/MovieStatus/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MovieStatus>> GetMovieStatus(byte id)
        {
            var movieStatus = await _context.MovieStatuses.FindAsync(id);

            if (movieStatus == null)
            {
                return NotFound();
            }

            return movieStatus;
        }

        // PUT: api/MovieStatus/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMovieStatus(byte id, MovieStatus movieStatus)
        {
            if (id != movieStatus.Id)
            {
                return BadRequest();
            }

            _context.Entry(movieStatus).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MovieStatusExists(id))
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

        // POST: api/MovieStatus
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<MovieStatus>> PostMovieStatus(MovieStatus movieStatus)
        {
            _context.MovieStatuses.Add(movieStatus);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMovieStatus", new { id = movieStatus.Id }, movieStatus);
        }

        // DELETE: api/MovieStatus/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<MovieStatus>> DeleteMovieStatus(byte id)
        {
            var movieStatus = await _context.MovieStatuses.FindAsync(id);
            if (movieStatus == null)
            {
                return NotFound();
            }

            _context.MovieStatuses.Remove(movieStatus);
            await _context.SaveChangesAsync();

            return movieStatus;
        }

        private bool MovieStatusExists(byte id)
        {
            return _context.MovieStatuses.Any(e => e.Id == id);
        }
    }
}
