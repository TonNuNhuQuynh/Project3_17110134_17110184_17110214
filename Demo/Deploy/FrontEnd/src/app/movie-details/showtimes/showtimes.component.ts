import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, QueryList, ViewChildren, AfterViewInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'app/api.service';
import { BookingInfo } from 'app/book-tickets/model';
import { LocationService } from 'app/location.service';
import { City } from 'app/manage-chains/model';
import { StorageService } from 'app/storage.service';
import { ToastService } from 'app/toast/toast.service';
import { CinemaChainVM, ShowDate, ShowtimeFormatVM, ShowtimeVM } from './model';

@Component({
  selector: 'app-showtimes',
  templateUrl: './showtimes.component.html',
  styleUrls: ['./showtimes.component.css']
})
export class ShowtimesComponent implements OnInit, AfterViewInit {

  constructor(private toast: ToastService, private router: Router, private renderer: Renderer2, private datePipe: DatePipe, private route: ActivatedRoute, private locationService: LocationService, private http: HttpClient, private apiService: ApiService) 
  { 
    
  }

  @ViewChildren('showtime') showtimes: QueryList<ElementRef>;

  cities: any[] = [];
  cityId: number = 0;
  localFields: Object = { text: 'name', value: 'id' };
  dates: ShowDate[] = [];
  activeDate: number = 0;
  movieId: number = 0;
  movieName: string = '';
  cinemaChains: CinemaChainVM[] = [];

  isLoaded: boolean = false;
  status: any;

  async ngOnInit(): Promise<void> 
  {
    this.route.queryParams.subscribe(params => {
      this.movieId = Number(params["movieId"]) || 0;
    });
    this.cityId = this.locationService.currentCity.id;
    await this.getCities();

    this.createDates();
  
    await this.initShowtimes();
    this.isLoaded = true;
    if (this.status != null && this.status == 0) this.toast.toastError("Đã hết thời gian giữ ghế. Mời đặt lại");
  }

  async initShowtimes()
  {
    let date = this.datePipe.transform(this.dates[this.activeDate].date, 'yyyy-MM-dd');
    let url = this.apiService.backendHost + `/api/CinemaChains/CheckShowtimes?movie=${this.movieId}&city=${this.cityId}&date=${date}`;
    let result = await this.http.get<CinemaChainVM[]>(url).toPromise();
    if (result != null) this.cinemaChains = result;
    else this.cinemaChains = [];
  }
  async getCities()
  {
    let url = this.apiService.cinemaChainHost + "/api/Cities";
    this.cities =  await this.http.get<City[]>(url).toPromise();
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
  
  async getShowtimes(chainId: number, cinemaId: number)
  {
    let chain = this.cinemaChains.find(c => c.id == chainId);
    let cinema = chain.cinemas.find(c => c.id == cinemaId);
  
    if (cinema.showtimeFormats != null) return;
    let date = this.datePipe.transform(this.dates[this.activeDate].date, 'yyyy-MM-dd');
    let url = this.apiService.cinemaChainHost + `/api/Showtimes?movie=${this.movieId}&cinema=${cinema.id}&date=${date}`;
    try 
    {
      cinema.showtimeFormats = await this.http.get<ShowtimeFormatVM[]>(url).toPromise();
    } 
    catch(e) 
    { 
      console.log(e) 
    }
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
    this.isLoaded = true;
  }
  async booking(showtime: ShowtimeVM, cinemaName: string, cinemaId: number, maxSeats: number, addr: string)
  {
    let bookingInfo: BookingInfo = 
    {
      movieName: this.movieName, 
      cinemaName: cinemaName, 
      cinemaId: cinemaId, 
      showtimeId: showtime.id, 
      startDate: showtime.startDate, 
      movieId: this.movieId, 
      cinemaAddr: addr,
      email: '',
      name: '',
      phone: '',
      orderId: 0
    }
    sessionStorage.setItem(StorageService.bookingInfo, JSON.stringify(bookingInfo));
    this.router.navigate(['../../booking'], { queryParams: {callback: this.router.url}, state: {info: bookingInfo}, relativeTo: this.route});
  }
  ngAfterViewInit(): void 
  {
    this.showtimes.changes.subscribe(c => { c.toArray().forEach((item: ElementRef) => 
    { 
      this.renderer.listen(item.nativeElement, 'click', () => {
        let chainId = item.nativeElement.name.split('-')[0];
        let cinemaId = item.nativeElement.name.split('-')[1];
        this.getShowtimes(chainId, cinemaId)
      })
    }) });
  }
}
