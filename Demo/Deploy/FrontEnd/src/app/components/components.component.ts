import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbCarousel, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { MovieWithAvgRatings } from 'app/manage-movies/model';
import { LoginModalComponent } from 'app/shared/login-modal/login-modal.component';
import { Movie } from 'app/shared/movie-modal/model';
import { RateModalComponent } from 'app/shared/rate-modal/rate-modal.component';
import { ToastService } from 'app/toast/toast.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import * as $ from 'jquery';
import { TrailerModalComponent } from 'app/movie-details/trailer-modal/trailer-modal.component';
@Component({
    selector: 'app-components',
    templateUrl: './components.component.html',
    styleUrls: ['./components.component.css']
})

export class ComponentsComponent implements OnInit {
   
  top4Movies: MovieWithAvgRatings[] = [];
  isLoaded: boolean = false;
  weeklyFavoriteMovies: Movie[] = [];
  isLoaded1: boolean = false;
  nowMovies: MovieWithAvgRatings[] = [];
  isLoaded2: boolean = false;
  recommends: MovieWithAvgRatings[] = [];
  isLoaded3: boolean = false;
  latestMovies: Movie[] = [];
  isLoaded4: boolean = false;
  
  activeId: number = 0;
  @ViewChild('largeCarousel') lgCarousel: NgbCarousel;


  customOptions: OwlOptions = {
        center: true,
        loop:true,
        margin: 25,
        nav: false,
        dots: true,
        autoplay: true,
        slideTransition: 'linear',
        autoplayTimeout: 6000,
        autoplaySpeed: 6000,
        autoplayHoverPause: true,
        // autoWidth: true,
        responsive: {
          0: {
            items: 1
          },
          400: {
            items: 2
          },
          740: {
            items: 4
          },
          940: {
            items: 6
          }
        },
  }

  customOptions2: OwlOptions = {
    // center: true,
    loop: true,
    margin: 15,
    nav: false,
    dots: true,
    autoplay: true,
    autoplayHoverPause: true,
    // autoWidth: true,
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 4
      },
      940: {
        items: 6
      }
    },
  }  

  customOptions3: OwlOptions = {
    pullDrag: true,
    center: true,
    loop: true,
    margin: 20,
    nav: true,
    dots: false,
    autoplay: true,
    autoplayHoverPause: true,
    autoWidth: false,
    responsive: {
      0: {
        items: 0
      },
      400: {
        items: 1
      },
      740: {
        items: 2
      },
      940: {
        items: 2
      }
    },
    navText : ["<i class='fa fa-chevron-left'></i>","<i class='fa fa-chevron-right'></i>"],
  }  

  constructor(private modalService: NgbModal, private auth: AuthenticationService, private http: HttpClient, private toastr: ToastService, private apiService: ApiService) {}
    
  async ngOnInit() 
  {
    await this.getTop4Movies();
    // this.lgCarousel.activeId = `lg-slide-${this.top4Movies[0].movie.id}`;
    this.fadeOut();
    await this.getWeeklyFavoriteMovies();
    await this.getMovies();
    if (this.auth.currentAccountValue != null) await this.getRecommends();
    await this.getLatest();
  }
  fadeOut()
  {
    var _this = this;
    $('#loading').fadeOut(1000, function() {
      _this.isLoaded = true;
    });
  }
  async getTop4Movies()
  {
    let url = this.apiService.backendHost + "/api/Movies/Top4";
    this.top4Movies = await this.http.get<MovieWithAvgRatings[]>(url).toPromise();
  }
  async getWeeklyFavoriteMovies()
  {
    let url = this.apiService.backendHost + "/api/Movies/Weekly";
    this.weeklyFavoriteMovies = await this.http.get<Movie[]>(url).toPromise();
    this.isLoaded1 = true;
  }
  pickSlide(id: number)
  {
    this.lgCarousel.select(`lg-slide-${id}`);
  }
  swipe(e: any)
  {
    if (e == 'swiperight') this.lgCarousel.prev();
    else this.lgCarousel.next();
  }
  async getMovies()
  {
    let url = this.apiService.backendHost + `/api/Movies/Status/1`;
    this.nowMovies = await this.http.get<MovieWithAvgRatings[]>(url).toPromise();
    if (this.nowMovies.length > 12) this.nowMovies = this.nowMovies.slice(0, 11);
    this.isLoaded2 = true;
  }
  openLoginModal()
  {
    const modalRef = this.modalService.open(LoginModalComponent, {windowClass: "login"});
    modalRef.result.then(async (result: any) => 
      {
        if (result == 'Success') window.location.reload();
        else this.toastr.toastError("Đăng nhập không thành công!");

      }, () => {})
  }
  async likeMovie(event: any, id: number)
  {
    if (this.auth.currentAccountValue == null) this.openLoginModal();
    else 
    {
      if (event.currentTarget.classList.contains('liked'))
      {
        let url = this.apiService.backendHost + `/api/MovieLikes/${id}`;
        try 
        {
          await this.http.delete(url).toPromise();
          this.toastr.toastSuccess("Unlike phim thành công!");
          this.auth.updateLike(id, false);
        }
        catch (e) { this.toastr.toastError("Unlike phim không thành công"); }
      }
      else 
      {
        let url = this.apiService.backendHost + `/api/MovieLikes`;
        try 
        {
          let postObject = {accountId: this.auth.currentAccountValue.id, movieId: id, date: new Date()}
          let result = await this.http.post(url, postObject).toPromise();
          if (result) 
          {
            this.toastr.toastSuccess("Like phim thành công!")
            this.auth.updateLike(id, true);
          }
        }
        catch (e) { this.toastr.toastError("Like phim không thành công"); }
      }
    }
  }
  async rateMovie(event: any, id: number)
  {
    let movie = this.nowMovies.find(m => m.movie.id == id).movie;
    var release = new Date(movie.releaseDate);
    release.setHours(0); 
    release.setMinutes(0); 
    release.setSeconds(0);

    var now = new Date();

    if (release.getTime() > now.getTime()) 
    {
      var hDiff = release.getTime() - now.getTime() / 3600000;
      if (hDiff > 48) 
      { 
        this.toastr.toastInfo('Chỉ được đánh giá phim 2 ngày trước ngày khởi chiếu!');
        return;
      }
    }

    if (this.auth.currentAccountValue == null) this.openLoginModal();
    else 
    {
      const rated = event.currentTarget.classList.contains('rated');
      const modalRef = this.modalService.open(RateModalComponent, {windowClass: "rate"});
      modalRef.componentInstance.movie = movie;
      modalRef.componentInstance.rated = rated;

      modalRef.result.then(async (result: any) => 
      {
        if (result == 'Success') window.location.reload();
        else if (result == 'Failed' && rated) this.toastr.toastError('Cập nhật đánh giá không thành công!');
        else if (result == 'Delete Failed' && rated) this.toastr.toastError('Xóa đánh giá không thành công!');
        else if (result == 'Failed' && !rated) this.toastr.toastError('Post đánh giá không thành công!');       
      }, () => {})
    }
  }
  async getLatest()
  {
    let url = this.apiService.backendHost + "/api/Movies/Latest";
    this.latestMovies = await this.http.get<Movie[]>(url).toPromise();
    this.isLoaded3 = true;
  }
  async getRecommends()
  {
    let url = this.apiService.backendHost + `/api/Movies/Recommend/${this.auth.currentAccountValue.id}`;
    let result = await this.http.get<MovieWithAvgRatings[]>(url).toPromise();
    this.isLoaded4 = true;
    if (result == null) return;
    this.recommends = result;
  }

  openTrailerModal(url: string)
  {
    if (url == null || url == '') 
    {
      this.toastr.toastInfo('Trailer của phim chưa được cập nhật!');
      return;
    }
    const modalRef = this.modalService.open(TrailerModalComponent, {windowClass: "rate"});
    modalRef.componentInstance.url = url;
    modalRef.result.then( () => {}, () => {})
  }
  
}
