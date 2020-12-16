using MovieReviewsAndTickets_API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class ActivityVM
    {
        public List<int> RateIds { get; set; }
        public List<int> MovieLikeIds { get; set; }
        public List<ReviewLike> ReviewLikes { get; set; }
    }
}
