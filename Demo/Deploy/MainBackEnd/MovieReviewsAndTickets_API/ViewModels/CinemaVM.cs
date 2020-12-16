using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class CinemaVM   //Cinema chứa lịch chiếu phân theo định dạng: 2D phụ đề việt/anh ...
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public List<ShowtimeFormatVM> ShowtimeFormats { get; set; }
    }
}
