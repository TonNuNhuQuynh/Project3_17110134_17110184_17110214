using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class MoviesInCinemaChain
    {
        //public Movie Movie { get; set; }
        public int MovieId { get; set; }
        public CinemaChain CinemaChain { get; set; }
        public int CinemaChainId { get; set; }
        public byte Status { get; set; }  //0: đang chiếu, 1: sắp chiếu, 2: chưa có lịch chiếu

    }
}
