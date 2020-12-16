using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.Models
{
    public class Movie
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }
        public string OriginalTitle { get; set; }
        public string Title { get; set; }
        public string Plot { get; set; }
        public string Directors { get; set; }
        public string Producers { get; set; }
        public DateTime ReleaseDate { get; set; }
        public ushort Runtime { get; set; }
        public string AgeRating { get; set; }
        public int[] Genres { get; set; }
        public string Poster { get; set; }
        public string Backdrop { get; set; }
        public string Trailer { get; set; }
        public Language Language { get; set; }
        public int LanguageId { get; set; }
        public MovieStatus MovieStatus { get; set; }
        public byte MovieStatusId { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public Account Account { get; set; }
        public int AccountId { get; set; }
        public ICollection<Cast> Casts { get; set; }
        public ICollection<MovieLike> MovieLikes { get; set; }
        public ICollection<Review> Reviews { get; set; }
        public ICollection<Order> Orders { get; set; }
    }
}
