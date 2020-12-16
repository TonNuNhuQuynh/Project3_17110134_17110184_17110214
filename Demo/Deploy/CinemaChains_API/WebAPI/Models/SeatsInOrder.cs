using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class SeatsInOrder
    {
        public Order Order { get; set; }
        public int OrderId { get; set; }
        public Seat Seat { get; set; }
        public int SeatId { get; set; }
        public decimal Price { get; set; }
    }
}
