import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from 'app/api.service';
import { Location } from '@angular/common';
import { MovieWithAvgRatings } from 'app/manage-movies/model';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'app/toast/toast.service';
import { LoginModalComponent } from 'app/shared/login-modal/login-modal.component';
import { RateModalComponent } from 'app/shared/rate-modal/rate-modal.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(private router: Router, private modalService: NgbModal, private toastr: ToastService, private auth: AuthenticationService, private location: Location, private http: HttpClient, private apiService: ApiService, private route: ActivatedRoute) 
  { 
    this.router.routeReuseStrategy.shouldReuseRoute = function () { return false; };
  }

  keyByName: boolean = false;
  keyByActor: boolean = false;
  keyByDirector: boolean = false;
  keyByProducer: boolean = false;

  query: string;
  key: string;
  isLoaded: boolean = false;
  movies: MovieWithAvgRatings[] = [];

  async ngOnInit(): Promise<void> 
  {
    this.route.queryParams.subscribe(params => {

      if (params['name']) 
      {
        this.keyByName = true;
        this.query = params['name'];
      }
      else if (params['actor']) 
      {
        this.keyByActor = true;
        this.query = params['actor'];
      }
      else if (params['director']) 
      {
        this.keyByDirector = true;
        this.query = params['director'];
      }
      else if (params['producer']) 
      {
        this.keyByProducer = true;
        this.query = params['producer'];
      }
      if (this.query == null) this.location.back();
    });
    
    // let params: Params = await this.route.queryParams.toPromise();
    // if (params == null) this.location.back();
    if (this.query != null) await this.searchMovies();
  }
  async searchMovies()
  {
    let url = this.apiService.backendHost + '/api/Movies/Search?';
    if (this.keyByName) url += `name=${this.query}`;
    else if (this.keyByActor) url += `actor=${this.query}`;
    else if (this.keyByDirector) url += `director=${this.query}`;
    else url += `producer=${this.query}`;
    this.movies = await this.http.get<MovieWithAvgRatings[]>(url).toPromise();
    this.isLoaded = true;
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
        console.log(url);
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
    let movie = this.movies.find(m => m.movie.id == id).movie;
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
}
