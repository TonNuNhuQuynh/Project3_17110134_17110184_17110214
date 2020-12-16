using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class ReviewLike
    {
        public Account Account { get; set; }
        public int AccountId { get; set; }
        public Review Review { get; set; }
        public int ReviewId { get; set; }
        public bool Liked { get; set; }
        public bool DisLiked { get; set; }
    }
}
