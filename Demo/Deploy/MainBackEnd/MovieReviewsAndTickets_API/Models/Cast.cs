using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class Cast
    {
        //[Key]
        //public int Id { get; set; }
        public Movie Movie { get; set; }
        public int MovieId { get; set; }
        public string Name { get; set; }
        public string Character { get; set; }
    }
}
