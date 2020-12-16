import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { ToastService } from 'app/toast/toast.service';
import { MovieDetails } from './model';
import { LoginModalComponent } from 'app/shared/login-modal/login-modal.component';
import { RateModalComponent } from 'app/shared/rate-modal/rate-modal.component';
import { TrailerModalComponent } from 'app/movie-details/trailer-modal/trailer-modal.component';
import { ReviewListComponent } from './review-list/review-list.component';
import { ShowtimesComponent } from './showtimes/showtimes.component';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent implements OnInit {

  movie: MovieDetails;
  movieId: number = 0;
  selectedTab: number = 0;
  isLoaded: boolean = false;

  constructor(private router: Router, private modalService: NgbModal, private auth: AuthenticationService, private toastr: ToastService, private http: HttpClient, private apiService: ApiService, private route: ActivatedRoute) { }

  async ngOnInit(): Promise<void> 
  {
    this.initMovie();
    this.route.queryParams.subscribe(params => {
      this.movieId = Number(params["movieId"]) || 0;
    });

    await this.getMovie();
    this.isLoaded = true;
    
    if (window.location.href.includes('reviews')) this.selectedTab = 1;
    else this.selectedTab = 2;
  }
  initMovie()
  {
    let m = {
      id: 0,
      originalTitle: '',
      title: '',
      plot: '',
      directors: '',
      producers: '',
      releaseDate: null,
      runtime: 0,
      ageRating: '',
      poster: '',
      backdrop: '',
      trailer: '',
      languageId: 0,
      movieStatusId: 0,
      genres: [],
      casts: [],
      accountId: 0,
      createdDate: null
    }
    this.movie = {movie: m, ratings: 0, genres: '', producers: [], directors: []};
  }
  async getMovie()
  {
    let url = this.apiService.backendHost + `/api/Movies/${this.movieId}`;
    try 
    {
      this.movie = await this.http.get<MovieDetails>(url).toPromise();
    }
    catch(e) { 
      this.router.navigate(['/not-found']);
    };
  }
  getBackdrop()
  {
    return (this.movie.movie.backdrop != '' && this.movie.movie.backdrop != null? `background: linear-gradient(rgb(0, 0, 0, 0.5), rgb(0, 0, 0, 0.80)), url('${this.movie.movie.backdrop}'); background-size: 100% 100%;`: "background-color: #12263f");
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
  async likeMovie(event: any)
  {
    if (this.auth.currentAccountValue == null) this.openLoginModal();
    else 
    {
      if (event.currentTarget.classList.contains('liked'))
      {
        let url = this.apiService.backendHost + `/api/MovieLikes/${this.movieId}`;
        try 
        {
          await this.http.delete(url).toPromise();
          this.toastr.toastSuccess("Unlike phim thành công!");
          this.auth.updateLike(this.movieId, false);
        }
        catch (e) { this.toastr.toastError("Unlike phim không thành công"); }
      }
      else 
      {
        let url = this.apiService.backendHost + `/api/MovieLikes`;
        try 
        {
          let postObject = {accountId: this.auth.currentAccountValue.id, movieId: this.movieId, date: new Date()}
          let result = await this.http.post(url, postObject).toPromise();
          if (result) 
          {
            this.toastr.toastSuccess("Like phim thành công!")
            this.auth.updateLike(this.movieId, true);
          }
        }
        catch (e) { this.toastr.toastError("Like phim không thành công"); }
      }
    }
  }

  async rateMovie(event: any)
  {
    var release = new Date(this.movie.movie.releaseDate);
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
      modalRef.componentInstance.movie = this.movie.movie;
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
  openTrailerModal()
  {
    if (this.movie.movie.trailer == null || this.movie.movie.trailer == '') 
    {
      this.toastr.toastInfo('Trailer của phim chưa được cập nhật!');
      return;
    }
    const modalRef = this.modalService.open(TrailerModalComponent, {windowClass: "rate"});
    modalRef.componentInstance.url = this.movie.movie.trailer;
    modalRef.result.then( () => {}, () => {})
  }
  onChildLoaded(component: ReviewListComponent | ShowtimesComponent) 
  {
    if (component instanceof ShowtimesComponent) 
    {
      component.movieName = this.movie.movie.title;
    } 
    else if (component instanceof ReviewListComponent) {
      component.movieAvgRating = this.movie.ratings;
    }
  }
}
