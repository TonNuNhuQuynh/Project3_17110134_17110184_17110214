using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class CheckoutInfo
    {
        public CinemaChain CinemaChain { get; set; }
        public int CinemaChainId { get; set; }
        public string PublicKey { get; set; }
        public string PrivateKey { get; set; }
    }
}
