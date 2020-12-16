using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class ShowtimeFormatVM
    {
        public string Name { get; set; }
        public List<ShowtimeVM> Showtimes { get; set; }
    }
}
