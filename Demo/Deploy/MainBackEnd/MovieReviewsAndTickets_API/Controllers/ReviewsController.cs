using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using Microsoft.ML.Trainers;
using Microsoft.VisualBasic;
using MovieReviewsAndTickets_API.DataModels;
using MovieReviewsAndTickets_API.Models;
using MovieReviewsAndTickets_API.ViewModels;

namespace MovieReviewsAndTickets_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private static int Threshold = 10;
        private MLContext _mlContext;
        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
            _mlContext = new MLContext();
        }

        // GET: api/Reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            return await _context.Reviews.ToListAsync();
        }

        // GET: api/Reviews/Details - Lấy chi tiết review -> rate-modal
        [HttpGet("Details")]
        public async Task<ActionResult<Review>> GetReviewOfAccount([FromQuery(Name = "movieId")] int movieId, [FromQuery(Name = "accountId")] int accountId)
        {
            var review = await _context.Reviews.Where(r => r.AccountId == accountId && r.MovieId == movieId && !r.IsDeleted).FirstOrDefaultAsync();
            if (review == null) return NotFound();
            return review;
        }

        // GET: api/Reviews/5 - Lấy các reviews của phim -> movie-details/review-list
        [HttpGet("{movieId}")]
        public async Task<ActionResult<ListReviewVM>> GetReviewsOfMovie(int movieId)
        {
            var lstReviewInDB = await _context.Reviews.Where(r => r.MovieId == movieId && !r.IsDeleted).Include(r => r.ReviewLikes).Include(r => r.Account).ThenInclude(a => a.User).ToListAsync();
            var likesOfMovie = await _context.MovieLikes.Where(r => r.MovieId == movieId).ToListAsync();
            var movieInDB = await _context.Movies.Where(m => m.Id == movieId).FirstOrDefaultAsync();

            List<Review> firstReviews = new List<Review>();
            firstReviews = lstReviewInDB;
            if (lstReviewInDB.Count > Threshold) firstReviews = lstReviewInDB.GetRange(0, Threshold);
         
            ListReviewVM listReviewVM = new ListReviewVM();
            foreach (var review in firstReviews)
            {
                int likes = review.ReviewLikes.Where(r => r.Liked).ToList().Count;
                int dislikes = review.ReviewLikes.Where(r => !r.Liked).ToList().Count;
                ReviewVM reviewVM = new ReviewVM() { Id = review.Id, Content = review.Content, Ratings = review.Ratings, Spoilers = review.Spoilers, CreatedDate = review.CreatedDate, MovieId = review.MovieId, LikeCounts = likes, DislikeCounts = dislikes, Username = review.Account.UserName, Image = review.Account.User.Image };
                listReviewVM.Reviews.Add(reviewVM);
            }
            listReviewVM.Total = lstReviewInDB.Count;
            listReviewVM.Likes = likesOfMovie.Count;
            //listReviewVM.Average = await AvgRatingsAsync(movieId);
            listReviewVM.Percent = CalculateSatisfiedScore(lstReviewInDB);
            listReviewVM.Title = movieInDB.OriginalTitle;
            listReviewVM.ReleaseDate = movieInDB.ReleaseDate;
            return listReviewVM;
        }

        [HttpGet("{movieId}/{startIndex}")]
        public async Task<ActionResult<IEnumerable<ReviewVM>>> LoadMoreReviews (int movieId, int startIndex)
        {
            var lstReviewInDB = await _context.Reviews.Where(r => r.MovieId == movieId && !r.IsDeleted).Include(r => r.ReviewLikes).Include(r => r.Account).ThenInclude(a => a.User).ToListAsync();
            int leftOver = lstReviewInDB.Count - startIndex;
            if (leftOver >= 10) lstReviewInDB = lstReviewInDB.GetRange(startIndex, Threshold);
            else lstReviewInDB = lstReviewInDB.GetRange(startIndex, leftOver);

            List<ReviewVM> reviews = new List<ReviewVM>();
            foreach (var review in lstReviewInDB)
            {
                int likes = review.ReviewLikes.Where(r => r.Liked).ToList().Count;
                int dislikes = review.ReviewLikes.Where(r => !r.Liked).ToList().Count;
                ReviewVM reviewVM = new ReviewVM() { Id = review.Id, Content = review.Content, Ratings = review.Ratings, Spoilers = review.Spoilers, CreatedDate = review.CreatedDate, MovieId = review.MovieId, LikeCounts = likes, DislikeCounts = dislikes, Username = review.Account.UserName, Image = review.Account.User.Image };
                reviews.Add(reviewVM);
            }
            return reviews;
        }

        // PUT: api/Reviews/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReview(int id, Review review)
        {
            if (id != review.Id)
            {
                return BadRequest();
            }

            var reviewInDB = await _context.Reviews.Where(r => r.Id == review.Id).FirstOrDefaultAsync();
            reviewInDB.Ratings = review.Ratings;
            reviewInDB.Spoilers = review.Spoilers;
            reviewInDB.Content = review.Content;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReviewExists(id))
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

        // POST: api/Reviews
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<IActionResult> PostReview(Review review)
        {
            var reviewInDB = await _context.Reviews.Where(r => r.AccountId == review.AccountId && r.MovieId == review.MovieId && r.IsDeleted).FirstOrDefaultAsync();
            if (reviewInDB != null)
            {
                reviewInDB.CreatedDate = DateTime.Now;
                reviewInDB.Content = review.Content;
                reviewInDB.Ratings = review.Ratings;
                reviewInDB.Spoilers = review.Spoilers;
                reviewInDB.IsDeleted = false;
            }    
            else _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            //Retrain model
            var reviews = await _context.Reviews.Select(r => new MovieRating() { userId = r.AccountId, movieId = r.MovieId, Label = r.Ratings }).ToListAsync();
            RetrainModel(_mlContext, reviews);
            return NoContent();
        }

        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Review>> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();
            review.IsDeleted = true;

            var reviewLikes = await _context.ReviewLikes.Where(m => m.AccountId == id).ToListAsync();
            _context.ReviewLikes.RemoveRange(reviewLikes);

            await _context.SaveChangesAsync();

            return review;
        }

        private bool ReviewExists(int id)
        {
            return _context.Reviews.Any(e => e.Id == id);
            
        }
        private int CalculateSatisfiedScore(List<Review> reviews)
        {
            int counts = 0;
            foreach (var r in reviews)
                if (r.Ratings >= 7) counts++;
            return reviews.Count > 0 ? (counts * 100) / reviews.Count : 0;
        }
        public static void RetrainModel(MLContext mlContext, List<MovieRating> data)
        {
            //Load Data
            IDataView trainingDataView = mlContext.Data.LoadFromEnumerable(data);

            // Tạo pipeline
            IEstimator<ITransformer> estimator = mlContext.Transforms.Conversion.MapValueToKey(outputColumnName: "userIdEncoded", inputColumnName: "userId")
            .Append(mlContext.Transforms.Conversion.MapValueToKey(outputColumnName: "movieIdEncoded", inputColumnName: "movieId"));

            var options = new MatrixFactorizationTrainer.Options
            {
                MatrixColumnIndexColumnName = "userIdEncoded",
                MatrixRowIndexColumnName = "movieIdEncoded",
                LabelColumnName = "Label",
                NumberOfIterations = 20,
                ApproximationRank = 100
            };
            var trainerEstimator = estimator.Append(mlContext.Recommendation().Trainers.MatrixFactorization(options));
            // Chạy Cross Validation
            var cvResults = mlContext.Regression.CrossValidate(trainingDataView, trainerEstimator, numberOfFolds: 5);
            // Lấy model tốt nhất
            var bestModel = cvResults.OrderByDescending(fold => fold.Metrics.RSquared).Select(fold => fold.Model).FirstOrDefault();
            mlContext.Model.Save(bestModel, trainingDataView.Schema, "TrainedModel/MovieRecommenderModel.zip");
        }
    }
}
