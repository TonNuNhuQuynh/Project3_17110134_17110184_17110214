using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Room
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public int Cols { get; set; }
        public int Rows { get; set; }
        public Cinema Cinema { get; set; }
        public int CinemaId { get; set; }
        public RoomType RoomType { get; set; }
        public int? RoomTypeId { get; set; }
        public ICollection<Seat> Seats { get; set; }
        public ICollection<Showtime> Showtimes { get; set; }
    }
}
