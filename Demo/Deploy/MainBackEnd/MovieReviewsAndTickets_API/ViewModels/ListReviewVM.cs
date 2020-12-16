using MovieReviewsAndTickets_API.Models;
using System;
using System.Collections.Generic;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class ListReviewVM
    {
        public ListReviewVM()
        {
            Reviews = new List<ReviewVM>();
        }
        public List<ReviewVM> Reviews { get; set; } //Danh sách Review
        public int Total { get; set; }              //Tổng số review
        public string Title { get; set; }           //Tựa phim
        public DateTime ReleaseDate { get; set; }   //Ngày ra mắt phim
        public int Percent { get; set; }            //Phần trăm đánh giá trên 7
       /* public float Average { get; set; }*/          // Số điểm TB
        public int Likes { get; set; }              // Số lượt thích

    }
}
