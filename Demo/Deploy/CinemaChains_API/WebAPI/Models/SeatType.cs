using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class SeatType
    {
        [Key]
        public byte Id { get; set; }
        public string Name { get; set; }
        public ICollection<SeatTypeInChain> SeatTypeInChains { get; set; }
        public ICollection<Seat> Seats { get; set; }
    }
}
