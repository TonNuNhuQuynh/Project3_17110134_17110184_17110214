using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        //private readonly string stripe_secret_key = "sk_test_51HlpUZBPY5M8bdT0GyFAwmukaKyJb7OCml5Fodx9sygudZuJWomhNEVHQLKenhMCkZAWSn6Ut78nYeiE3WkBwWZq00cjjNO4kw";
        //private readonly string stripe_key_2 = "sk_test_bFesAIYDFEr7RVlA0BC9PAWe00rnO78sdD";
        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }


        // POST: api/Orders -> OrdersController của Main backend

        [HttpPost]
        public async Task<IActionResult> PostOrder(PaymentRequest paymentRequest)
        {
            // Id của các ghế muốn thanh toán
            List<int> seatIds = paymentRequest.Order.SeatsInOrders.Select(s => s.SeatId).ToList();
            // Lấy Id các ghế đã được thanh toán của suất chiếu
            var orderIds = await _context.Orders.Where(o => o.ShowtimeId == paymentRequest.Order.ShowtimeId).Select(o => o.Id).ToListAsync();
            var paidSeatIds = await _context.SeatsInOrders.Where(s => orderIds.Contains(s.OrderId)).Select(s => s.SeatId).ToListAsync();
            List<int> unavailables = seatIds.Where(s => paidSeatIds.IndexOf(s) > -1).ToList();

            //Nếu 1 trong số các ghế đã đc chọn trước
            if (unavailables.Count > 0) return NotFound();
            else
            {
                var showtime = await _context.Showtimes
                                     .Where(s => s.Id == paymentRequest.Order.ShowtimeId)
                                     .Include(s => s.Cinema).ThenInclude(s => s.CinemaChain).ThenInclude(c => c.CheckoutInfo).FirstOrDefaultAsync();
                // Charge order
                StripeConfiguration.ApiKey = showtime.Cinema.CinemaChain.CheckoutInfo.PrivateKey;
                var myCharge = new ChargeCreateOptions();
                myCharge.Source = paymentRequest.Token;
                myCharge.Amount = (long)paymentRequest.Order.Total;
                myCharge.Currency = "vnd";
                myCharge.Description = "Booking tickets";
                myCharge.Metadata = new Dictionary<string, string>();
                myCharge.Metadata["OurRef"] = "OurRef-" + Guid.NewGuid().ToString();

                try
                {
                    var chargeService = new ChargeService();
                    Charge stripeCharge = chargeService.Create(myCharge);
                    if (stripeCharge.Status == "failed") return Content("Invalid card");
                    // Thêm order vào database
                    paymentRequest.Order.CreatedDate = DateTime.Now;
                    _context.Orders.Add(paymentRequest.Order);
                    await _context.SaveChangesAsync();
                    return Content(paymentRequest.Order.Id.ToString());
                }
                catch(Exception e)
                {
                    return Content("Invalid card");
                }
            }
        }
    }
    public class PaymentRequest
    {
        public Models.Order Order { get; set; }
        public string Token { get; set; }
    }
}
