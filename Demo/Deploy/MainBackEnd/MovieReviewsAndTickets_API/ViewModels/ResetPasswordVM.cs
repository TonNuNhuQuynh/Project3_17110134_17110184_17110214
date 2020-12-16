using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MovieReviewsAndTickets_API.ViewModels
{
    public class ResetPasswordVM
    {
        public int AccountId { get; set; }
        public string Code { get; set; }
        public string Password { get; set; }
    }
}
