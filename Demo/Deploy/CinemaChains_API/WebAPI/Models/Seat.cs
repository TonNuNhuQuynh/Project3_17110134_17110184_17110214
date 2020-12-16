using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Seat
    {
        [Key]
        public int Id { get; set; }
        public string Code { get; set; }
        public int RowIndex { get; set; }
        public int ColIndex { get; set; }
        public Room Room { get; set; }
        public int RoomId { get; set; }
        public Seat CoupleSeatA { get; set; }
        public int? CoupleSeatId { get; set; }
        public Seat CoupleSeatB { get; set; }
        public SeatType SeatType { get; set; }
        public byte SeatTypeId { get; set; }
        public ICollection<SeatsInOrder> SeatsInOrders { get; set; }

    }
}
