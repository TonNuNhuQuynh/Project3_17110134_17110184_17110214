using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class MovieLike
    {
        public Account Account { get; set; }
        public int AccountId { get; set; }
        public Movie Movie { get; set; }
        public int MovieId { get; set; }
        public DateTime Date { get; set; }
    }
}
