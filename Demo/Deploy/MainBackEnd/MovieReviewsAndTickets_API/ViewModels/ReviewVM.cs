using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class ReviewVM
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public byte Ratings { get; set; }
        public bool Spoilers { get; set; }
        public DateTime CreatedDate { get; set; }
        public int MovieId { get; set; }
        public string Username { get; set; }
        public string Image { get; set; }
        public int LikeCounts { get; set; }
        public int DislikeCounts { get; set; }

    }
}
