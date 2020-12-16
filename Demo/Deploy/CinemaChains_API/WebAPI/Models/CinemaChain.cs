using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class CinemaChain
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string CountryCode { get; set; }
        public string Logo { get; set; }
        public ushort NoOfMaxSeats { get; set; }
        public ICollection<RoomType> RoomTypes { get; set; }
        public ICollection<ScreenFormat> ScreenFormats { get; set; }
        public ICollection<Cinema> Cinemas { get; set; }
        public ICollection<MoviesInCinemaChain> MoviesInCinemaChains { get; set; }
        public ICollection<SeatTypeInChain> SeatTypeInChains { get; set; }
        public CheckoutInfo CheckoutInfo { get; set; }

    }
}
