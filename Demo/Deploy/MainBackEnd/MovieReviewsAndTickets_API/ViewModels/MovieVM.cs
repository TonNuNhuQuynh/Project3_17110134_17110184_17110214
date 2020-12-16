using MovieReviewsAndTickets_API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class MovieVM
    {
        public Movie Movie { get; set; }
        public float Ratings { get; set; }
    }
}
