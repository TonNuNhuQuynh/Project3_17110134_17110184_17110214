using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        public decimal Total { get; set; }
        public DateTime Showtime { get; set; }
        public string RoomName { get; set; }
        public DateTime CreatedDate { get; set; }
        public Account Account { get; set; }
        public int AccountId { get; set; }
        public Cinema Cinema { get; set; }
        public int CinemaId { get; set; }
        public Movie Movie { get; set; }
        public int MovieId { get; set; }
        public ICollection<SeatsInOrder> SeatsInOrders { get; set; }

    }
}
