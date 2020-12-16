using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.ViewModels
{
    public class SeatVM
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public int RowIndex { get; set; }
        public int ColIndex { get; set; }
        public byte Status { get; set; }
        public int? CoupleSeatId { get; set; }
        public byte SeatTypeId { get; set; }
    }
}
