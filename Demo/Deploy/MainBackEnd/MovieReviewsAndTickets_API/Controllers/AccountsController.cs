using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using MovieReviewsAndTickets_API.Helpers;
using MovieReviewsAndTickets_API.Models;
using MovieReviewsAndTickets_API.Services;
using MovieReviewsAndTickets_API.ViewModels;
using Newtonsoft.Json;

namespace MovieReviewsAndTickets_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        private readonly UserManager<Account> _userManager;

        private IEmailSender _emailSender;
        public AccountsController(ApplicationDbContext context, UserManager<Account> userManager, IOptions<AppSettings> appSettings, IEmailSender emailSender)
        {
            _context = context;
            _userManager = userManager;
            _emailSender = emailSender;
        }

        // GET: Lấy list account -> manage-accounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountVM>>> GetAccounts()
        {
            var lstAccountVM = new List<AccountVM>();
            var lstAccount = await _context.Accounts.Where(a => a.IsDeleted == false).Include(a => a.User).ToListAsync();

            foreach (var account in lstAccount)
            {
                account.User.Account = null;
                AccountVM accountVM = new AccountVM()
                {
                    Id = account.Id,
                    Username = account.UserName,
                    Email = account.Email,
                    Password = null,
                    Phone = null,
                    IsActive = !account.LockoutEnabled,
                    User = account.User,
                    RoleName = _userManager.GetRolesAsync(account).Result.ToList()[0]
                };
                lstAccountVM.Add(accountVM);
            }
            return lstAccountVM;
        }

        //GET: Lấy profile của user -> profile
        [HttpGet("{id}")]
        public async Task<ActionResult<AccountVM>> GetAccount(int id)
        {
            var account = await _context.Accounts.Include(a => a.User).Where(a => a.Id == id && a.IsDeleted == false).FirstAsync();
            if (account == null) return NoContent();
            account.User.Account = null;

            AccountVM accountVM = new AccountVM()
            {
                Id = account.Id,
                Username = account.UserName,
                Email = account.Email,
                Password = null,
                Phone = account.PhoneNumber == null? "": account.PhoneNumber,
                IsActive = !account.LockoutEnabled,
                User = account.User,
                RoleName = _userManager.GetRolesAsync(account).Result.ToList()[0]
            };
            return accountVM;
        }

        //PUT: Edit profile của user -> profile
        [HttpPut("{id}")]
        public async Task<ActionResult<AccountVM>> EditProfile(int id, AccountVM account)
        {
            if (id != account.Id)
            {
                return BadRequest();
            }

            var accountInDB = await _context.Accounts.Where(u => u.Id == id).FirstAsync();
            accountInDB.PhoneNumber = account.Phone;

            //var user = JsonConvert.DeserializeObject<User>(HttpContext.Request.Form["user"]);
            var userInDb = await _context.Users.Where(u => u.AccountId == id).FirstAsync();
            userInDb.Fullname = account.User.Fullname;
            userInDb.Area = account.User.Area;
            userInDb.Image = account.User.Image;

            //if (HttpContext.Request.Form.Files.Count > 0)
            //{
            //    var file = HttpContext.Request.Form.Files[0];

            //    byte[] fileData = null;

            //    using (var binaryReader = new BinaryReader(file.OpenReadStream()))
            //    {
            //        fileData = binaryReader.ReadBytes((int)file.Length);
            //    }

            //    userInDb.Image = fileData;
            //}

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccountExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            account.User = userInDb;
            return account;
        }
        //PUT: Đổi password của user -> profile
        [HttpPut("Password/{id}")]
        public async Task<ActionResult<AccountVM>> ChangePassword(int id, PasswordVM password)
        {
            var accountInDb = await _context.Accounts.Where(u => u.Id == id).FirstAsync();
            var r = _userManager.ChangePasswordAsync(accountInDb, password.CurrentPassword, password.NewPassword);
            if (r.Result.Succeeded) return Content("Success");
            else
            {
                var message = string.Join(", ", r.Result.Errors.Select(x => "Code " + x.Code + " Description" + x.Description));
                return Content(message);
            }
        }

        //PUT: Block user -> manage-accounts
        [HttpPut("Block/{id}")]
        public async Task<IActionResult> BlockAccount(int id, AccountVM account)
        {
            if (id != account.Id)
            {
                return BadRequest();
            }

            var accountInDB = _context.Accounts.Where(a => a.Id == id && a.IsDeleted == false).FirstOrDefault();
            accountInDB.LockoutEnabled = !account.IsActive;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccountExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        //POST: Login và trả về activities của user (phim đã like, rate vs review like/unlike) -> login-modal
        [HttpPost]
        [Route("Login")]
        public async Task<ActionResult<object>> Login(AccountVM account)
        {
            var accountInDB = await _context.Accounts.Where(a => a.UserName.ToLower() == account.Username.ToLower() && a.IsDeleted == false).Include(a => a.User).FirstOrDefaultAsync();
            if (accountInDB == null) return NotFound();
            if (!accountInDB.EmailConfirmed) return new JsonResult("email");
            if (accountInDB.LockoutEnabled) return new JsonResult("locked");
            PasswordVerificationResult passresult = _userManager.PasswordHasher.VerifyHashedPassword(accountInDB, accountInDB.PasswordHash, account.Password);
            if (passresult == PasswordVerificationResult.Failed) return NotFound();
            account.Id = accountInDB.Id;
            account.Password = null;
            account.RoleName = _userManager.GetRolesAsync(accountInDB).Result.ToList()[0];
            account.User.Image = accountInDB.User.Image;

            var rates = await _context.Reviews.Where(r => r.AccountId == account.Id).ToListAsync();
            var movieLikes = await _context.MovieLikes.Where(r => r.AccountId == account.Id).ToListAsync();
            var reviewLikes = await _context.ReviewLikes.Where(r => r.AccountId == account.Id).Select(r => new ReviewLike { AccountId = r.AccountId, ReviewId = r.ReviewId, Liked = r.Liked, DisLiked = r.DisLiked }).ToListAsync();
            ActivityVM activity = new ActivityVM() { RateIds = rates.Select(r => r.MovieId).ToList(), MovieLikeIds = movieLikes.Select(r => r.MovieId).ToList(), ReviewLikes = reviewLikes };
            return new { Account = account, Activities = activity };
        }

        //POST: Đăng kí account và gửi mail xác nhận -> register
        [HttpPost]
        public async Task<ActionResult> Register(AccountVM account)
        {
            var lstEmail = await _context.Accounts.Where(a => a.Email.ToLower() == account.Email.ToLower()).ToListAsync();
            var lstUsername = await _context.Accounts.Where(a => a.UserName.ToLower() == account.Username.ToLower()).ToListAsync();

            if (lstEmail.Count > 0 && lstUsername.Count > 0) return Content("username,email");
            else if (lstEmail.Count > 0) return Content("email");
            else if (lstUsername.Count > 0) return Content("username");

            Account accountInDB = new Account()
            {
                UserName = account.Username,
                Email = account.Email,
                EmailConfirmed = false,
                IsDeleted = false,
                CreatedDate = DateTime.Now,
                SecurityStamp = Guid.NewGuid().ToString()
            };
            var r = await _userManager.CreateAsync(accountInDB, account.Password);

            if (r.Succeeded)
            {
                var savedAccount = await _userManager.FindByNameAsync(account.Username);
                await _userManager.AddToRoleAsync(savedAccount, RolesHelper.User);

                User user = account.User;
                user.AccountId = savedAccount.Id;
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                string token = await this._userManager.GenerateEmailConfirmationTokenAsync(savedAccount);
                var callbackUrl = $"{ApiHelper.FrontEndHost}/verify?userId={savedAccount.Id}&code={Base64Token(token)}";

                await this._emailSender.SendEmailAsync(savedAccount.Email, "Xác nhận lập tài khoản thành công", $"Xin chào {savedAccount.UserName}, <br>" +
                    $"Bạn đã đăng ký thành công tài khoản, tuy nhiên bạn cần xác thực để kích hoạt tài khoản của bạn bằng cách nhấn vào đường dẫn sau <a href={callbackUrl}>here</a>");
                return Content(savedAccount.Id.ToString());
            }
            else
            {
                var message = string.Join(", ", r.Errors.Select(x => "Code " + x.Code + " Description" + x.Description));
                return Content(message);
            }
        }

        //POST: Xác nhận email -> verify-email
        [HttpPost]
        [Route("ConfirmEmail")]
        public async Task<ActionResult> ConfirmRegistration (ConfirmEmailVM confirmEmailVM)
        {
            if (string.IsNullOrWhiteSpace(confirmEmailVM.Code))
            {
                ModelState.AddModelError("", "Code are required");
                return BadRequest(ModelState);
            }
            var accountInDB = _context.Accounts.Where(a => a.Id == confirmEmailVM.AccountId && a.IsDeleted == false).FirstOrDefault();
            if (accountInDB == null) return NotFound();

            if (accountInDB.EmailConfirmed) return NoContent();

            var codeDecodedBytes = WebEncoders.Base64UrlDecode(confirmEmailVM.Code);
            var codeDecoded = Encoding.UTF8.GetString(codeDecodedBytes);
            IdentityResult result = await this._userManager.ConfirmEmailAsync(accountInDB, codeDecoded);
            if (result.Succeeded) return Content("Success");
            else
            {
                var message = string.Join(", ", result.Errors.Select(x => "Code " + x.Code + " Description" + x.Description));
                return Content(message);
            }
        }

        // POST: Super admin tạo account admin -> manage-accounts
        [HttpPost]
        [Route("Admin")]
        public async Task<ActionResult> PostAdminAccount(AccountVM account)
        {
            var lstEmail = await _context.Accounts.Where(a => a.Email.ToLower() == account.Email.ToLower()).ToListAsync();
            var lstUsername = await _context.Accounts.Where(a => a.UserName.ToLower() == account.Username.ToLower()).ToListAsync();

            if (lstEmail.Count > 0 && lstUsername.Count > 0) return Content("username,email");
            else if (lstEmail.Count > 0) return Content("email");
            else if (lstUsername.Count > 0) return Content("username");

            Account accountInDB = new Account() { Id = 0, UserName = account.Username, Email = account.Email, EmailConfirmed = false, LockoutEnabled = false, IsDeleted = false, CreatedDate = DateTime.Now, SecurityStamp = Guid.NewGuid().ToString() };
            var r = await _userManager.CreateAsync(accountInDB, account.Username);

            if (r.Succeeded)
            {
                var savedAccount = await _userManager.FindByNameAsync(account.Username);
                await _userManager.AddToRoleAsync(savedAccount, RolesHelper.Admin);

                User user = account.User;
                user.AccountId = savedAccount.Id;
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                string token = await this._userManager.GenerateEmailConfirmationTokenAsync(savedAccount);
                var callbackUrl = $"{ApiHelper.FrontEndHost}/verify?userId={savedAccount.Id}&code={Base64Token(token)}";
                
                await this._emailSender.SendEmailAsync(accountInDB.Email, "Xác nhận vai trò Admin", $"Xin chào {savedAccount.UserName}, <br>" +
                    $"Bạn đã được thêm vào hệ thống của website với vai trò Admin, trước tiên bạn cần xác thực để kích hoạt tài khoản bằng cách nhấn vào đường dẫn sau <a href={callbackUrl}>here</a>");
                return Content(savedAccount.Id.ToString());
            }
            else
            {
                var message = string.Join(", ", r.Errors.Select(x => "Code " + x.Code + " Description" + x.Description));
                return Content(message);
            }
        }

        // DELETE: Xóa account -> manage-accounts
        [HttpDelete("{id}")]
        public async Task<ActionResult<Account>> DeleteAccount(int id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null) return NotFound();
            account.IsDeleted = true;

            var movieLikes = await _context.MovieLikes.Where(m => m.AccountId == id).ToListAsync();
            _context.MovieLikes.RemoveRange(movieLikes);
            var reviewLikes = await _context.ReviewLikes.Where(m => m.AccountId == id).ToListAsync();
            _context.ReviewLikes.RemoveRange(reviewLikes);
            var reviews = await _context.Reviews.Where(m => m.AccountId == id).ToListAsync();
            reviews.ForEach(review => { review.IsDeleted = true; });
            await _context.SaveChangesAsync();

            return account;
        }

        [HttpGet("Storage/{accountId}")]
        public async Task<ActionResult<object>> GetActivityStorage(int accountId)
        {
            var rates = await _context.Reviews.Where(r => r.AccountId == accountId && r.IsDeleted == false).ToListAsync();
            var movieLikes = await _context.MovieLikes.Where(r => r.AccountId == accountId).ToListAsync();
            var reviewLikes = await _context.MovieLikes.Where(r => r.AccountId == accountId).ToListAsync();

            return new { RateIds = rates.Select(r => r.Id).ToList(), MovieLikeIds = movieLikes.Select(r => r.MovieId).ToList(), ReviewLikes = reviewLikes };
        }

        private bool AccountExists(int id)
        {
            return _context.Accounts.Any(e => e.Id == id);
        }
        // Chuyển token về dạng base64
        private string Base64Token(string token)
        {
            byte[] tokenGeneratedBytes = Encoding.UTF8.GetBytes(token);
            return WebEncoders.Base64UrlEncode(tokenGeneratedBytes);
        }

        //Gửi email reset password -> send-email
        [HttpGet("SendEmailResetPassword")]
        public async Task<ActionResult> SendEmailResetPassword([FromQuery(Name="email")] string email)
        {
            var accountInDb = await _context.Accounts.Where(a => a.Email.ToLower() == email.ToLower() && a.IsDeleted == false).FirstOrDefaultAsync();
            if (accountInDb == null) return NoContent();
            string token = await this._userManager.GeneratePasswordResetTokenAsync(accountInDb);
            var callbackUrl = $"{ApiHelper.FrontEndHost}/reset?userId={accountInDb.Id}&code={Base64Token(token)}";
            await this._emailSender.SendEmailAsync(accountInDb.Email, "Đặt lại mật khẩu", $"Xin chào {accountInDb.UserName}, <br>" +
                $"Bạn có thể đặt lại mật khẩu cho tài khoản của mình bằng cách nhấn vào đường dẫn sau <a href={callbackUrl}>here</a>");
            accountInDb.LockoutEnabled = true;
            await _context.SaveChangesAsync();
            return new JsonResult(accountInDb.Id.ToString());
        }

        //POST: Đặt lại mật khẩu -> reset-password
        [HttpPost("ResetPassword")]
        public async Task<ActionResult> ResetPassword(ResetPasswordVM resetPassword)
        {
            if (string.IsNullOrWhiteSpace(resetPassword.Code))
            {
                ModelState.AddModelError("", "Code are required");
                return BadRequest(ModelState);
            }
            var accountInDB = _context.Accounts.Where(a => a.Id == resetPassword.AccountId && a.IsDeleted == false).FirstOrDefault();
            if (accountInDB == null) return NotFound();

            var codeDecodedBytes = WebEncoders.Base64UrlDecode(resetPassword.Code);
            var codeDecoded = Encoding.UTF8.GetString(codeDecodedBytes);
            IdentityResult result = await _userManager.ResetPasswordAsync(accountInDB, codeDecoded, resetPassword.Password);
            if (result.Succeeded)
            {
                accountInDB.LockoutEnabled = false;
                await _context.SaveChangesAsync();
                return new JsonResult("Success");
            }
            else
            {
                var message = string.Join(", ", result.Errors.Select(x => "Code " + x.Code + " Description" + x.Description));
                return new JsonResult(message);
            }
        }
    }
}
