import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { ToastService } from 'app/toast/toast.service';
import { DatePipe, Location } from '@angular/common';
import { ShowDate, ShowtimeVM } from 'app/movie-details/showtimes/model';
import { CinemaVM, ShowtimesInMovie } from './model';
import { BookingInfo } from 'app/book-tickets/model';
import { StorageService } from 'app/storage.service';
import { Movie } from 'app/shared/movie-modal/model';
import { TrailerModalComponent } from 'app/movie-details/trailer-modal/trailer-modal.component';
import { LocationService } from 'app/location.service';
import { CinemasModalComponent } from 'app/shared/cinemas-modal/cinemas-modal.component';

@Component({
  selector: 'app-cinema-details',
  templateUrl: './cinema-details.component.html',
  styleUrls: ['./cinema-details.component.css']
})
export class CinemaDetailsComponent implements OnInit {
  constructor(private locationService: LocationService, private router: Router, private datePipe: DatePipe, private modalService: NgbModal, private toastr: ToastService, private auth: AuthenticationService, private location: Location, private http: HttpClient, private apiService: ApiService, private route: ActivatedRoute) 
  { 
    this.router.routeReuseStrategy.shouldReuseRoute = function () { return false; };
  }
  cinemaId: number = 0;
  cinema: CinemaVM = {id: 0, name: '', address: '', logo: '', cinemaChainId: 0, description: '', cityId: 0, cinemaChainName: ''};
  dates: ShowDate[] = [];
  activeDate: number = 0;
  moviesWithShowtimes: ShowtimesInMovie[] = [];
  isLoaded: boolean = false;
  cityName: string = '';

  async ngOnInit(): Promise<void> 
  {
    this.route.queryParams.subscribe(params => {
      this.cinemaId = params['cinema'] || 0;
      if (this.cinemaId == 0) this.location.back();
    });

    this.createDates();
    
    if (this.cinemaId != 0) await this.getCinemaInfo();
    this.cityName = this.locationService.cities.find(c => c.id == this.cinema.cityId).name;
    
    await this.initShowtimes();
  }

  async getCinemaInfo()
  {
    let url = this.apiService.backendHost + `/api/Cinemas/${this.cinemaId}`;
    this.cinema = await this.http.get<CinemaVM>(url).toPromise();
  }
  createDates()
  {
    for (let i = 0; i < 6; i++) 
    {
      let now = new Date()
      let newDate = new Date(now.setDate(now.getDate() + i));
      let dayOfWeek = newDate.getDay() == 0? 'CN': `Th ${newDate.getDay() + 1}`;
      this.dates.push({date: newDate, dayOfWeek: dayOfWeek});
    }
    this.activeDate = 0;
  }
  async initShowtimes()
  {
    let date = this.datePipe.transform(this.dates[this.activeDate].date, 'yyyy-MM-dd');
    let url = this.apiService.backendHost + `/api/Cinemas/Showtimes?cinema=${this.cinemaId}&date=${date}`;
    let r = await this.http.get<ShowtimesInMovie[]>(url).toPromise();
    if (r != null) this.moviesWithShowtimes = r;
    else this.moviesWithShowtimes = [];
    this.isLoaded = true;
  }
  overtime(sDate): boolean
  {
    let now = new Date()
    let date = new Date(sDate);
    if (date < now) return true;
    return false;
  }
  async pickDate(index: number)
  {
    if (this.activeDate == index) return;
    this.activeDate = index;
    this.isLoaded = false;
    await this.initShowtimes();
  }
  async booking(showtime: ShowtimeVM, movieName: string, movieId: number)
  {
    let bookingInfo: BookingInfo = 
    {
      movieName: movieName, 
      cinemaName: this.cinema.name, 
      cinemaId: this.cinemaId, 
      showtimeId: showtime.id, 
      startDate: showtime.startDate, 
      movieId: movieId, 
      cinemaAddr: this.cinema.address,
      email: '',
      name: '',
      phone: '',
      orderId: 0
    }
    sessionStorage.setItem(StorageService.bookingInfo, JSON.stringify(bookingInfo));
    this.router.navigate(['/booking'], { queryParams: {callback: this.router.url}, state: {info: bookingInfo}, relativeTo: this.route});
  }
  openTrailerModal(movie: Movie)
  {
    if (movie.trailer == null || movie.trailer == '') 
    {
      this.toastr.toastInfo('Trailer của phim chưa được cập nhật!');
      return;
    }
    const modalRef = this.modalService.open(TrailerModalComponent, {windowClass: "rate"});
    modalRef.componentInstance.url = movie.trailer;
    modalRef.result.then( (result: any) => {}, (reason: any) => {})
  }
  openCinemasModal()
  {
    const modalRef = this.modalService.open(CinemasModalComponent, {windowClass: "rate"});
    modalRef.componentInstance.cityId = this.cinema.cityId;
    modalRef.componentInstance.cityName = this.cityName;
    modalRef.result.then(async (result: any) => 
    { }, (reason: any) => {})
  }
}
