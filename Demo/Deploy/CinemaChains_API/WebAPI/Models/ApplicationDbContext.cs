using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        public DbSet<Cinema> Cinemas { get; set; }
        public DbSet<CinemaChain> CinemaChains { get; set; }
        public DbSet<MoviesInCinemaChain> MoviesInCinemaChains { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Seat> Seats { get; set; }
        public DbSet<SeatType> SeatTypes { get; set; }
        public DbSet<SeatTypeInChain> SeatTypeInChains { get; set; }
        public DbSet<Showtime> Showtimes { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<SeatsInOrder> SeatsInOrders { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<ScreenFormat> ScreenFormats { get; set; }
        public DbSet<CheckoutInfo> CheckoutInfos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cinema>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.HasOne(a => a.CinemaChain).WithMany(u => u.Cinemas).HasForeignKey(a => a.CinemaChainId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.City).WithMany(u => u.Cinemas).HasForeignKey(a => a.CityId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<CinemaChain>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.HasOne(a => a.CheckoutInfo).WithOne(u => u.CinemaChain).HasForeignKey<CheckoutInfo>(u => u.CinemaChainId).OnDelete(DeleteBehavior.Cascade);
            });
            //modelBuilder.Entity<Movie>(entity =>
            //{
            //    entity.Property(e => e.Id).UseIdentityColumn();

            //});
            modelBuilder.Entity<MoviesInCinemaChain>(entity =>
            {
                entity.HasKey(e => new { e.CinemaChainId, e.MovieId });
                //entity.HasOne(a => a.Movie).WithMany(u => u.MoviesInCinemaChains).HasForeignKey(a => a.MovieId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.CinemaChain).WithMany(u => u.MoviesInCinemaChains).HasForeignKey(a => a.CinemaChainId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Room>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.HasOne(a => a.Cinema).WithMany(u => u.Rooms).HasForeignKey(a => a.CinemaId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.RoomType).WithMany(u => u.Rooms).HasForeignKey(a => a.RoomTypeId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<RoomType>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.HasOne(a => a.CinemaChain).WithMany(u => u.RoomTypes).HasForeignKey(a => a.CinemaChainId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Seat>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.HasOne(a => a.Room).WithMany(u => u.Seats).HasForeignKey(a => a.RoomId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.CoupleSeatA).WithOne(u => u.CoupleSeatB).HasForeignKey<Seat>(a => a.CoupleSeatId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.SeatType).WithMany(u => u.Seats).HasForeignKey(a => a.SeatTypeId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<SeatType>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
            });
            modelBuilder.Entity<SeatTypeInChain>(entity =>
            {
                entity.HasKey(e => new { e.CinemaChainId, e.SeatTypeId });
                entity.HasOne(a => a.SeatType).WithMany(u => u.SeatTypeInChains).HasForeignKey(a => a.SeatTypeId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.CinemaChain).WithMany(u => u.SeatTypeInChains).HasForeignKey(a => a.CinemaChainId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Showtime>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.HasOne(a => a.Cinema).WithMany(u => u.Showtimes).HasForeignKey(a => a.CinemaId).OnDelete(DeleteBehavior.Restrict);
                //entity.HasOne(a => a.Movie).WithMany(u => u.Showtimes).HasForeignKey(a => a.MovieId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Room).WithMany(u => u.Showtimes).HasForeignKey(a => a.RoomId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.ScreenFormat).WithMany(u => u.Showtimes).HasForeignKey(a => a.ScreenFormatId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
            });
            modelBuilder.Entity<SeatsInOrder>(entity =>
            {
                entity.HasKey(e => new { e.OrderId, e.SeatId });
                entity.HasOne(a => a.Order).WithMany(u => u.SeatsInOrders).HasForeignKey(a => a.OrderId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Seat).WithMany(u => u.SeatsInOrders).HasForeignKey(a => a.SeatId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<City>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
            });
            modelBuilder.Entity<ScreenFormat>(entity =>
            {
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.HasOne(a => a.CinemaChain).WithMany(u => u.ScreenFormats).HasForeignKey(a => a.CinemaChainId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<CheckoutInfo>(entity =>
            {
                entity.HasKey(e => new { e.CinemaChainId, e.PublicKey, e.PrivateKey });
            });
        }
    }
}
