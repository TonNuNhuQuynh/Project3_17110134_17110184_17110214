using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class Genre
    {
        [Key]
        public byte Id { get; set; }
        public string Name { get; set; }
    }
}
