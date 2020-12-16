using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.ViewModels
{
    public class ShowtimeVM
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public string Info { get; set; }
    }
}
