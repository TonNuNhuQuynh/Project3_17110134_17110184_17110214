using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class SeatsInOrderVM
    {
        public int OrderId { get; set; }
        public int SeatId { get; set; }
        public string Code { get; set; }
        public decimal Price { get; set; }
    }
}
