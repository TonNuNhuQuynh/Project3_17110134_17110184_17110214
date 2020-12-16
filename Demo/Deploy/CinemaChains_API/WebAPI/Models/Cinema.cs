using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Cinema
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string Location { get; set; }
        public CinemaChain CinemaChain { get; set; }
        public int CinemaChainId { get; set; }
        public City City { get; set; }
        public int CityId { get; set; }
        public ICollection<Room> Rooms { get; set; }
        public ICollection<Showtime> Showtimes { get; set; }
    }
}
