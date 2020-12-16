using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class SeatsInOrder
    {
        public Order Order { get; set; }
        public int OrderId { get; set; }
        public int SeatId { get; set; }
        public string SeatCode { get; set; }
    }
}
