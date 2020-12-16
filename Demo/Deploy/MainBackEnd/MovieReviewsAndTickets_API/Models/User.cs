using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Fullname { get; set; }
        public string Area { get; set; }
        public string Image { get; set; }
        public Account Account { get; set; }
        public int AccountId { get; set; }
    }
}
