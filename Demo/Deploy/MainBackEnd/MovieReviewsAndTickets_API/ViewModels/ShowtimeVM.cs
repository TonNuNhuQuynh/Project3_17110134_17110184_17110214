using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class ShowtimeVM
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public string Info { get; set; }
    }
}
