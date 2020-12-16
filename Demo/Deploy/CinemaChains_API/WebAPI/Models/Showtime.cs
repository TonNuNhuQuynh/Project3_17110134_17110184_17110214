using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Showtime
    {
        [Key]
        public int Id { get; set; }
        //public Movie Movie { get; set; }
        public int MovieId { get; set; }
        public Cinema Cinema { get; set; }
        public int CinemaId { get; set; }
        public Room Room { get; set; }
        public int RoomId { get; set; }
        public ScreenFormat ScreenFormat { get; set; }
        public int ScreenFormatId { get; set; }
        public DateTime StartDate { get; set; }
        public decimal Price { get; set; }
        public ICollection<Order> Orders { get; set; }
    }
}
