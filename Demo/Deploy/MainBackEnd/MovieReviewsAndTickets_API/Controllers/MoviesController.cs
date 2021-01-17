using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.ML;
using MovieReviewsAndTickets_API.DataModels;
using MovieReviewsAndTickets_API.Models;
using MovieReviewsAndTickets_API.ViewModels;

namespace MovieReviewsAndTickets_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly PredictionEnginePool<MovieRating, MovieRatingPrediction> _model;
        public MoviesController(ApplicationDbContext context, PredictionEnginePool<MovieRating, MovieRatingPrediction> model)
        {
            _context = context;
            _model = model;
        }

        // GET: api/Movies - Lấy list movie -> manage-movies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovieVM>>> GetMovies()
        {
            var movies = await _context.Movies.Where(m => m.IsDeleted == false).Include(m => m.Language).ToListAsync();
            var reviews = await _context.Reviews.ToListAsync();
            List<MovieVM> lstMovies = new List<MovieVM>();
            foreach (var m in movies)
            {
                float avgRatings = AvgRatingsAsync(reviews.Where(r => r.MovieId == m.Id && r.IsDeleted == false).ToList());
                m.Reviews = null;
                lstMovies.Add(new MovieVM() { Movie = m, Ratings = avgRatings });
            }
            return lstMovies;
        }

        // GET: api/Movies/Status/1 - Lấy list movie theo status: 1 là Now, 2 là Upcoming -> movie-list
        [HttpGet("Status/{statusId}")]
        public async Task<ActionResult<IEnumerable<MovieVM>>> GetMoviesBasedOnStatus(byte statusId)
        {
            var movies = await _context.Movies.Where(m => m.MovieStatusId == statusId && m.IsDeleted == false).ToListAsync();
            var reviews = await _context.Reviews.ToListAsync();
            List<MovieVM> lstMovies = new List<MovieVM>();
            foreach (var m in movies)
            {
                float avgRatings = AvgRatingsAsync(reviews.Where(r => r.MovieId == m.Id && r.IsDeleted == false).ToList());
                lstMovies.Add(new MovieVM() { Movie = m, Ratings = avgRatings });
            }
            return lstMovies;

        }

        // GET: api/Movies/5 - Lấy chi tiết phim -> movie-details
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetMovie(int id)
        {
            var movie = await _context.Movies.Include(m => m.Casts).Where(m => m.Id == id && m.IsDeleted == false).FirstOrDefaultAsync();
            if (movie == null) return NotFound();
            var reviews = await _context.Reviews.Where(r => r.MovieId == id && r.IsDeleted == false).ToListAsync();
            float avgRatings = AvgRatingsAsync(reviews);
            string genres = "";
            var genresOfMovie = await _context.Genres.Where(g => movie.Genres.Contains(g.Id)).ToListAsync();
            foreach (var item in genresOfMovie)
                genres += item.Name + ", ";

            char[] charsToTrim = { ' ' };
            string[] directors = movie.Directors.Trim(charsToTrim).Split(',');
            string[] producers = movie.Directors.Trim(charsToTrim).Split(',');
            return new { Movie = movie, Ratings = avgRatings, Genres = genres.Substring(0, genres.Length - 2), Directors = directors, Producers = producers };
        }

        // PUT: api/Movies/5 - Sửa chi tiết movie -> movie-modal
        [HttpPut("{id}")]
        public async Task<ActionResult<Movie>> PutMovie(int id, Movie movie)
        {
            if (id != movie.Id)
            {
                return BadRequest();
            }

            _context.Entry(movie).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MovieExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return movie;
        }

        // POST: api/Movies - thêm movie -> add-movie
        [HttpPost]
        public async Task<ActionResult<Movie>> PostMovie(Movie movie)
        {
            movie.CreatedDate = DateTime.Now;
            if (MovieExists(movie.Id)) return Conflict(); //Phim đã có và chưa xóa
            else if (IsMovieDeleted(movie.Id)) _context.Entry(movie).State = EntityState.Modified; //Phim đã có và xóa rồi
            else _context.Movies.Add(movie);  //Chưa có và chưa xóa
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetMovie", new { id = movie.Id }, movie);
        }

        // DELETE: api/Movies/5 - Xóa phim -> manage-movies
        [HttpDelete("{id}")]
        public async Task<ActionResult<Movie>> DeleteMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound();

            movie.IsDeleted = true;
            await _context.SaveChangesAsync();

            return movie;
        }
        // Tính điểm TB của phim
        private float AvgRatingsAsync(List<Review> reviews)
        {
            float totalRatings = 0;
            if (reviews.Count == 0) return 0;
            foreach (var r in reviews)
                totalRatings += r.Ratings;
            return (float)totalRatings / reviews.Count;
        }
        private bool MovieExists(int id)
        {
            return _context.Movies.Any(e => e.Id == id && e.IsDeleted == false);
        }
        private bool IsMovieDeleted(int id)
        {
            return _context.Movies.Any(e => e.Id == id && e.IsDeleted == true);
        }
        // GET: api/Movies - Lấy top 4 rated movie -> home
        [HttpGet("Top4")]
        public async Task<ActionResult<IEnumerable<MovieVM>>> GetTop4RatedMovies()
        {
            var reviews = await _context.Reviews.ToListAsync();
            var movies = await _context.Movies.ToListAsync();
            List<Movie> top4Movies = movies.Where(m => m.IsDeleted == false)
                                           .OrderByDescending(m => AvgRatingsAsync(reviews.Where(r => r.MovieId == m.Id && r.IsDeleted == false).ToList()))
                                           .ThenByDescending(m => reviews.Where(r => r.MovieId == m.Id && r.IsDeleted == false).ToList().Count)
                                           .Take(4).ToList();
            
            List<MovieVM> lstMovies = new List<MovieVM>();
            foreach (var m in top4Movies)
            {
                float avgRatings = AvgRatingsAsync(reviews.Where(r => r.MovieId == m.Id && r.IsDeleted == false).ToList());
                lstMovies.Add(new MovieVM() { Movie = m, Ratings = avgRatings });
            }
            return lstMovies;
        }

        // GET: api/Movies/Weekly - Lấy <= 30 phim yêu thích trong tuần -> home
        [HttpGet("Weekly")]
        public async Task<ActionResult<IEnumerable<Movie>>> GetWeeklyFavMovies()
        {
            DateTime now = DateTime.Now;
            DateTime sevenDaysEarlier = now.AddDays(-7);
            var lstMovieLikes = await _context.MovieLikes.Include(m => m.Movie)
                                                           .Where(m => m.Date >= sevenDaysEarlier && m.Date <= now)
                                                           .OrderByDescending(m => m.Date).Select(m => m.Movie).ToListAsync();
            var weeklyFavMovies = lstMovieLikes.Distinct().Where(m => m.IsDeleted == false).ToList();

            if (weeklyFavMovies.Count < 6)
            {
                weeklyFavMovies = await _context.MovieLikes.Include(m => m.Movie)
                                                           .OrderByDescending(m => m.Date).Select(m => m.Movie).ToListAsync();
                weeklyFavMovies = weeklyFavMovies.Where(m => m.IsDeleted == false).Distinct().ToList();
                return weeklyFavMovies.Count > 30 ? weeklyFavMovies.Take(30).ToList() : weeklyFavMovies;
            }
            return weeklyFavMovies;
        }

        // GET: api/Movies/Search - Seach phim theo tên, diễn viên, đạo diễn hoặc nsx -> search
        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<MovieVM>>> GetSearchMovies([FromQuery(Name = "name")] string name, [FromQuery(Name = "actor")] string actor, [FromQuery(Name = "director")] string director, [FromQuery(Name = "producer")] string producer)
        {
            List<Movie> searchMovies;
            if (name != null) searchMovies = await _context.Movies.Where(m => m.Title.ToLower()
                                                                  .Contains(name.ToLower()) || m.OriginalTitle.ToLower().Contains(name.ToLower()) && m.IsDeleted == false)
                                                                  .ToListAsync();
            else if (director != null) searchMovies = await _context.Movies.Where(m => m.Directors.ToLower().Contains(director.ToLower()) && m.IsDeleted == false).ToListAsync();
            else if (producer != null) searchMovies = await _context.Movies.Where(m => m.Producers.ToLower().Contains(director.ToLower()) && m.IsDeleted == false).ToListAsync();
            else
            {
                var lstMovieIds = await _context.Casts.Where(c => c.Name.ToLower().Contains(actor.ToLower())).Select(m => m.MovieId).ToListAsync();
                searchMovies = await _context.Movies.Where(m => lstMovieIds.Contains(m.Id) && m.IsDeleted == false).ToListAsync();
            }
            var reviews = await _context.Reviews.ToListAsync();
            return searchMovies.Select(m => new MovieVM() { Movie = m, Ratings = AvgRatingsAsync(reviews.Where(r => r.MovieId == m.Id && r.IsDeleted == false).ToList()) }).ToList();
        }

        // GET: api/Movies/Watchlist - lấy tủ phim của user
        [HttpGet("Watchlist/{accountId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetWatchlist(int accountId)
        {
            var watchlist = await _context.Reviews.Where(r => r.AccountId == accountId && !r.IsDeleted)
                                                  .Include(r => r.Movie)
                                                  .Select(r => new { Id = r.MovieId, Title = r.Movie.Title, Poster = r.Movie.Poster, ReleaseDate = r.Movie.ReleaseDate, Ratings = r.Ratings })
                                                  .ToListAsync();

            var likedMovies = await _context.MovieLikes.Where(r => r.AccountId == accountId)
                                                  .Include(r => r.Movie)
                                                  .Select(r => new { Id = r.MovieId, Title = r.Movie.Title, Poster = r.Movie.Poster, ReleaseDate = r.Movie.ReleaseDate, Ratings = (byte)0 })
                                                  .ToListAsync();
            likedMovies.ForEach(movie => { if (!watchlist.Any(w => w.Id == movie.Id)) watchlist.Add(movie); });
            return watchlist;
        }

        // GET: api/Movies/Latest - Lấy trailer của những phim mới nhất
        [HttpGet("Latest")]
        public async Task<ActionResult<IEnumerable<object>>> GetLatestTrailers()
        {
            var latest = await _context.Movies.Where(m => !m.IsDeleted && (m.Trailer != null && m.Trailer != ""))
                                                 .OrderByDescending(m => m.ReleaseDate)
                                                 .Take(5)
                                                 .Select(r => new { Id = r.Id, Title = r.Title, Backdrop = r.Backdrop, ReleaseDate = r.ReleaseDate, Trailer = r.Trailer })
                                                 .ToListAsync();
            return latest;
        }
        [HttpGet("Recommend/{userId}")]
        public async Task<ActionResult<IEnumerable<MovieVM>>> RecommendMovies(int userId)
        {
            var reviews = await _context.Reviews.ToListAsync();
            // Lấy id của những phim mà user đã đánh giá
            var ratedIds = reviews.Where(r => r.AccountId == userId).Select(r => r.MovieId).ToList();
            if (ratedIds.Count == 0) return NoContent();
            // Sử dụng model để dự đoán rating của userId lên một số phim
            var recommendedMovies = new List<Movie>();
            MovieRatingPrediction prediction = null;
            foreach (var movie in _context.Movies.OrderBy(x => Guid.NewGuid()).ToList())
            {
                movie.Reviews = null;
                if (ratedIds.Contains(movie.Id)) continue;
                prediction = _model.Predict(new MovieRating
                {
                    userId = userId,
                    movieId = movie.Id
                });
                if (prediction.Score >= 7) recommendedMovies.Add(movie);
                // Chỉ recommend 6 phim
                if (recommendedMovies.Count == 6) break;
            }
            return recommendedMovies.Select(m => new MovieVM() { Movie = m, Ratings = AvgRatingsAsync(reviews.Where(r => r.MovieId == m.Id).ToList()) }).ToList();
        }
    }
}
