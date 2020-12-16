using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class CinemaCountsInCityVM
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Counts { get; set; }
    }
    public class City
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
