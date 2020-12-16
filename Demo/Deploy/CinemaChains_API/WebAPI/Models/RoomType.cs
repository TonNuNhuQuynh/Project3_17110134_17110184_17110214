using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class RoomType
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal ExtraFee { get; set; }
        public CinemaChain CinemaChain { get; set; }
        public int CinemaChainId { get; set; }
        public ICollection<Room> Rooms  { get; set; }
    }
}
