using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MovieReviewsAndTickets_API.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MovieReviewsAndTickets_API.Models
{
    public class ApplicationDbContext : IdentityDbContext<Account, Role, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Cast> Casts { get; set; }
        public DbSet<Cinema> Cinemas { get; set; }
        public DbSet<CinemaChain> CinemaChains { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<Language> Languages { get; set; }
        public DbSet<Movie> Movies { get; set; }
        public DbSet<MovieLike> MovieLikes { get; set; }
        public DbSet<MovieStatus> MovieStatuses { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewLike> ReviewLikes { get; set; }
        public DbSet<SeatsInOrder> SeatsInOrders { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Account>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.HasOne(a => a.User).WithOne(u => u.Account).HasForeignKey<User>(u => u.AccountId).OnDelete(DeleteBehavior.Cascade);
                //entity.HasOne(a => a.Role).WithMany(u => u.Accounts).HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Cast>(entity =>
            {
                entity.HasKey(e => new { e.MovieId, e.Name });
                entity.HasOne(a => a.Movie).WithMany(u => u.Casts).HasForeignKey(u => u.MovieId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Cinema>(entity =>
            {
                entity.HasOne(a => a.CinemaChain).WithMany(u => u.Cinemas).HasForeignKey(a => a.CinemaChainId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Genre>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
            });
            modelBuilder.Entity<Language>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
            });
            modelBuilder.Entity<Movie>(entity =>
            {
                var genresConverter = new ValueConverter<int[], string>(
                    genre => string.Join(";", genre),
                    genre => genre.Split(";", StringSplitOptions.RemoveEmptyEntries).Select(val => int.Parse(val)).ToArray());

                entity.HasOne(a => a.Language).WithMany(u => u.Movies).HasForeignKey(a => a.LanguageId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.MovieStatus).WithMany(u => u.Movies).HasForeignKey(a => a.MovieStatusId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Account).WithMany(u => u.Movies).HasForeignKey(a => a.AccountId).OnDelete(DeleteBehavior.Restrict);
                entity.Property(e => e.Genres).HasConversion(genresConverter);
            });
            modelBuilder.Entity<MovieLike>(entity =>
            {
                entity.HasKey(e => new { e.AccountId, e.MovieId });
                entity.HasOne(a => a.Account).WithMany(u => u.MovieLikes).HasForeignKey(a => a.AccountId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Movie).WithMany(u => u.MovieLikes).HasForeignKey(a => a.MovieId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<MovieStatus>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
            });
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasOne(a => a.Cinema).WithMany(u => u.Orders).HasForeignKey(a => a.CinemaId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Account).WithMany(u => u.Orders).HasForeignKey(a => a.AccountId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Movie).WithMany(u => u.Orders).HasForeignKey(a => a.MovieId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Review>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.HasOne(a => a.Movie).WithMany(u => u.Reviews).HasForeignKey(a => a.MovieId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Account).WithMany(u => u.Reviews).HasForeignKey(a => a.AccountId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<ReviewLike>(entity =>
            {
                entity.HasKey(e => new { e.AccountId, e.ReviewId });
                entity.HasOne(a => a.Review).WithMany(u => u.ReviewLikes).HasForeignKey(a => a.ReviewId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Account).WithMany(u => u.ReviewLikes).HasForeignKey(a => a.AccountId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<SeatsInOrder>(entity =>
            {
                entity.HasKey(e => new { e.SeatId, e.OrderId });
                entity.HasOne(a => a.Order).WithMany(u => u.SeatsInOrders).HasForeignKey(a => a.OrderId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
            });
            modelBuilder.Entity<Role>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
            });

            modelBuilder.Entity<Role>().HasData(new List<Role>
            {
                new Role
                {
                    Id = 1,
                    Name = RolesHelper.User,
                    NormalizedName = RolesHelper.User.ToLower()
                },
                new Role 
                {
                    Id = 2,
                    Name = RolesHelper.Admin,
                    NormalizedName = RolesHelper.Admin.ToLower()
                },
                new Role 
                {
                   Id = 3,
                   Name = RolesHelper.SuperAdmin,
                   NormalizedName = RolesHelper.SuperAdmin.ToLower()
                },
            });
            var hasher = new PasswordHasher<Account>();

            modelBuilder.Entity<Account>().HasData(
                new Account
                {
                    Id = 1,
                    UserName = "tnnhuquynh",
                    NormalizedUserName = "tnnhuquynh",
                    PasswordHash = hasher.HashPassword(null, "121899"),
                    Email = "17110214@student.hcmute.edu.vn",
                    EmailConfirmed = true,
                    LockoutEnabled = false
                }
            );

            modelBuilder.Entity<User>().HasData(
                new User() { AccountId = 1, Image = null, Area = null, Fullname = "Tôn Nữ Như Quỳnh", Id = 1 }
            );

            modelBuilder.Entity<IdentityUserRole<int>>().HasData(
                new IdentityUserRole<int>
                {
                    RoleId = 3, // for super admin 
                    UserId = 1  // for super admin role
                }
            );
        }
    }
}
