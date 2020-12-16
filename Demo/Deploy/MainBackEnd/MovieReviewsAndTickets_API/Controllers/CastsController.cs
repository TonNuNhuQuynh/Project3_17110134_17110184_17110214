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
    public class CastsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CastsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Casts/5 - Lấy cast của movie -> movie-cast-modal
        [HttpGet("{movieId}")]
        public async Task<ActionResult<IEnumerable<Cast>>> GetCast(int movieId)
        {
            var cast = await _context.Casts.Where(c => c.MovieId == movieId).ToListAsync();

            if (cast == null)
            {
                return NotFound();
            }

            return cast;
        }

        //PUT: chỉnh sửa cast của movie -> movie-cast-modal
        [HttpPut("{id}")]
        public async Task<ActionResult<IEnumerable<Cast>>> PutCast(int id, List<Cast> casts)
        {
            var lstCastInDB = await _context.Casts.Where(c => c.MovieId == id).ToListAsync();
            _context.Casts.RemoveRange(lstCastInDB);
            _context.Casts.AddRange(casts);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CastExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return casts;
        }

        // DELETE: api/Casts/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Cast>> DeleteCast(int id)
        {
            var cast = await _context.Casts.FindAsync(id);
            if (cast == null)
            {
                return NotFound();
            }

            _context.Casts.Remove(cast);
            await _context.SaveChangesAsync();

            return cast;
        }

        private bool CastExists(int id)
        {
            return _context.Casts.Any(e => e.MovieId == id);
        }
    }
}
