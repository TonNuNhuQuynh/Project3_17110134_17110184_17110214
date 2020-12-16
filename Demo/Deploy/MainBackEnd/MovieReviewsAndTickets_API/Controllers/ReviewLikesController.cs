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
    public class ReviewLikesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewLikesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ReviewLikes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewLike>>> GetReviewLikes()
        {
            return await _context.ReviewLikes.ToListAsync();
        }

        // GET: api/ReviewLikes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewLike>> GetReviewLike(int id)
        {
            var reviewLike = await _context.ReviewLikes.FindAsync(id);

            if (reviewLike == null)
            {
                return NotFound();
            }

            return reviewLike;
        }
        

        //Post like hoặc unlike review -> movie-details/review-list
        [HttpPost]
        public async Task<ActionResult<ReviewLike>> PostReviewLike(ReviewLike reviewLike)
        {
            var reviewLikeInDB = await _context.ReviewLikes.Where(r => r.AccountId == reviewLike.AccountId && r.ReviewId == reviewLike.ReviewId).FirstOrDefaultAsync();
            if (reviewLikeInDB == null) _context.ReviewLikes.Add(reviewLike);
            else if (reviewLikeInDB != null && reviewLike.Liked == false && reviewLike.DisLiked == false) _context.ReviewLikes.Remove(reviewLikeInDB);
            else
            {
                reviewLikeInDB.Liked = reviewLike.Liked;
                reviewLikeInDB.DisLiked = reviewLike.DisLiked;
            }
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)  { throw; }
            return reviewLike;
        }
    }
}
