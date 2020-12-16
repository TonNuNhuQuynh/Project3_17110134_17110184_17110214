using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public Showtime Showtime { get; set; }
        public int ShowtimeId { get; set; }
        public decimal Total { get; set; }
        public DateTime CreatedDate { get; set; }
        public ICollection<SeatsInOrder> SeatsInOrders { get; set; }
    }
}
