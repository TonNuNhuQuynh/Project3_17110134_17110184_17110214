using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.ViewModels
{
    public class RoomVM
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Cols { get; set; }
        public int Rows { get; set; }
        public decimal MinPrice { get; set; }
        public string CheckoutKey { get; set; }
        public ushort NoOfMaxSeats { get; set; }
        public ICollection<SeatTypeVM> SeatTypes { get; set; }
        public ICollection<SeatVM> Seats { get; set; }

    }
}
