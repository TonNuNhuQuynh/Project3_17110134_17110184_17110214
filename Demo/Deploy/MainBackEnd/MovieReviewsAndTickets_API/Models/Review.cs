using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }
        public string Content { get; set; }
        public byte Ratings { get; set; }
        public bool Spoilers { get; set; }
        public DateTime CreatedDate { get; set; }
        public Movie Movie { get; set; }
        public int MovieId { get; set; }
        public Account Account { get; set; }
        public int AccountId { get; set; }
        public bool IsDeleted { get; set; }
        public ICollection<ReviewLike> ReviewLikes { get; set; }

    }
}
