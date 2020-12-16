using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class Account: IdentityUser<int>
    {
        //public Role Role { get; set; }
        //public int RoleId { get; set; }  
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public User User { get; set; }
        public ICollection<ReviewLike> ReviewLikes { get; set; }
        public ICollection<MovieLike> MovieLikes { get; set; }
        public ICollection<Review> Reviews { get; set; }
        public ICollection<Order> Orders { get; set; }
        public ICollection<Movie> Movies { get; set; }
    }
}
