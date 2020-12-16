using MovieReviewsAndTickets_API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class CinemaChainVM
    {
        public int Id { get; set; }
        public string Logo { get; set; }
        public string Name { get; set; }
        public ushort NoOfMaxSeats { get; set; }
        public List<CinemaVM> Cinemas { get; set; }
    }
}
