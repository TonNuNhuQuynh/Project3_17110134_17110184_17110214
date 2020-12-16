using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.ViewModels
{
    public class SeatTypeVM
    {
        public byte Id { get; set; }
        public string Name { get; set; }
        public decimal ExtraFee { get; set; }
    }
}
