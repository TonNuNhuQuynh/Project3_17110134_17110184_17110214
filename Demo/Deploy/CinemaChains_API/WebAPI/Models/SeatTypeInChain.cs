using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class SeatTypeInChain
    {
        public SeatType SeatType { get; set; }
        public byte SeatTypeId { get; set; }
        public CinemaChain CinemaChain { get; set; }
        public int CinemaChainId { get; set; }
        public decimal ExtraFee { get; set; }
    }
}
