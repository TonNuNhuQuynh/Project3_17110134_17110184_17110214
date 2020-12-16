using MovieReviewsAndTickets_API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class OrderVM
    {
        public int Id { get; set; }
        public decimal Total { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public DateTime Showtime { get; set; }
        public string RoomName { get; set; }
        public DateTime CreatedDate { get; set; }
        public int AccountId { get; set; }
        public int CinemaId { get; set; }
        public int MovieId { get; set; }
        public int ShowtimeId { get; set; }
        public List<SeatsInOrderVM> SeatsInOrderVMs { get; set; }
    }
}
