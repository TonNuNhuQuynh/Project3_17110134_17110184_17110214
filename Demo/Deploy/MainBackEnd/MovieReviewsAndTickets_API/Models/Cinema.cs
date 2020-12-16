using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class Cinema
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string Location { get; set; }
        public CinemaChain CinemaChain { get; set; }
        public int CinemaChainId { get; set; }
        public int CityId { get; set; }
        public bool IsDeleted { get; set; }
        public ICollection<Order> Orders { get; set; }
    }
}
