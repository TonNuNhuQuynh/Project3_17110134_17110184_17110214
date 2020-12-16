using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class CinemaChain
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Logo { get; set; }
        public ushort NoOfMaxSeats { get; set; }
        public bool IsDeleted { get; set; }
        public ICollection<Cinema> Cinemas { get; set; }
    }
}
