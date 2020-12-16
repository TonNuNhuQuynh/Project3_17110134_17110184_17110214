import { Component, OnInit, AfterViewInit, HostListener, OnDestroy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { Router } from '@angular/router';
import { BookingInfo, RoomVM, SelectedSeat } from './model';
import { ApiService } from 'app/api.service';
import { HttpClient } from '@angular/common/http';
import { SeatsComponent } from './seats/seats.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorModalComponent } from './error-modal/error-modal.component';
import { StorageService } from 'app/storage.service';

@Component({
  selector: 'app-book-tickets',
  templateUrl: './book-tickets.component.html',
  styleUrls: ['./book-tickets.component.css']
})
export class BookTicketsComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked{

  bookingInfo: BookingInfo;
  roomInfo: RoomVM = {id: 0, name: '', cols: 0, rows: 0, minPrice: 0, checkoutKey:'', seats: [], seatTypes: [], noOfMaxSeats: 0}
  isLoaded: boolean = false;
  selectedSeats: SelectedSeat[] = [];
  total: number = 0;
  countdownColor: string = '#000000';
  countdownText: string = '';
  previousURL: string;
  activeTab: number = 2;
  done: boolean = false;
  endDate: Date;

  constructor(private chRef: ChangeDetectorRef, private datePipe: DatePipe, private modalService: NgbModal, private http: HttpClient, private router: Router, private location: Location, private apiService: ApiService) 
  { 
    if (router.getCurrentNavigation().extras.state != null)
    {
      this.bookingInfo = this.router.getCurrentNavigation().extras.state.info;
      this.previousURL = this.router.getCurrentNavigation().extras.queryParams.callback;
    }
  }
  ngAfterViewChecked(): void 
  {
    this.chRef.detectChanges();
  }
  
  ngOnDestroy(): void 
  {
    this.removePage();
  }
  ngAfterViewInit(): void 
  {
    if (sessionStorage.getItem(StorageService.countdown) == null)
    {
      this.endDate = new Date(Date.now());
      this.endDate.setMinutes(this.endDate.getMinutes() + 5);
    }
    else this.endDate = new Date(sessionStorage.getItem(StorageService.countdown))
    this.countDown();
  }

  async ngOnInit(): Promise<void> 
  {
    if (this.bookingInfo == null) 
    {
      this.bookingInfo = JSON.parse(sessionStorage.getItem(StorageService.bookingInfo));
      this.previousURL = sessionStorage.getItem(StorageService.callbackUrl);
      this.selectedSeats = JSON.parse(sessionStorage.getItem(StorageService.selectedSeats));
      this.total = Number(sessionStorage.getItem(StorageService.orderTotal));
    }
    await this.getRoomInfo();
  }
  async getRoomInfo()
  {
    let url = this.apiService.cinemaChainHost + `/api/Showtimes/${this.bookingInfo.showtimeId}`;
    try
    {
      this.roomInfo = await this.http.get<RoomVM>(url).toPromise();
      this.isLoaded = true;
    }
    catch(e) { console.log(e); this.router.navigate(['not-found']) }
  }
  onChildLoaded(component: SeatsComponent | CheckoutComponent | TicketDetailsComponent) 
  {
    //this.chRef.detectChanges();
    if (component instanceof SeatsComponent) 
    {
      this.activeTab = 1;
      component.roomInfo = this.roomInfo;
      component.selectedSeats = this.selectedSeats;
      component.total = this.total;

      component.seatChanged.subscribe((data: SelectedSeat[]) => {
        this.selectedSeats = data;
      })

      component.totalChanged.subscribe((data: number) => {
        this.total = data;
      })
    }
    else if (component instanceof CheckoutComponent) 
    {
      this.activeTab = 2;
      component.roomInfo = this.roomInfo;
      component.selectedSeats = this.selectedSeats;
      component.bookingInfo = this.bookingInfo;
      component.total = this.total;
      component.redirectUrl = this.previousURL;

      component.bookingInfoChanged.subscribe((data: BookingInfo) => {
        this.bookingInfo = data;
      })
    }
    else if (component instanceof TicketDetailsComponent) 
    {
      this.activeTab = 3;
      this.done = true;
      component.bookingInfo = this.bookingInfo;
      component.redirectUrl = this.previousURL;
    }
  }
 
  countDown()
  {
    var _this = this;
    var x = setInterval(function() {
      var distance = _this.endDate.getTime() - Date.now();
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      _this.countdownText = `0${minutes < 0? 0: minutes}:${seconds < 10? `0${seconds < 0? 0: seconds}`: seconds }`;   
      if (minutes <= 1) _this.countdownColor = '#f5593d';
      if (distance <= 0) 
      {
        clearInterval(x);
        if(window.location.href.includes('seats') || window.location.href.includes('checkout')) _this.openError();
      }
    }, 1000);
  }
  checkout()
  {
    if (window.location.href.includes('seats')) this.router.navigate(['/booking/checkout'])
  }
  isNext(): boolean
  {
    if (window.location.href.includes('seats')) return true;
    return false;
  }
  openError()
  {
    const modalRef = this.modalService.open(ErrorModalComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.message = 'Hết thời gian giữ ghế. Hãy thực hiện lại đơn hàng của bạn';
    modalRef.componentInstance.redirectUrl = this.previousURL;

    modalRef.result.then((result: string) => {}, (reason: any) => {})
  }
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    this.savePage();
  }
  savePage()
  {
    sessionStorage.setItem(StorageService.bookingInfo, JSON.stringify(this.bookingInfo));
    sessionStorage.setItem(StorageService.callbackUrl, this.previousURL);
    sessionStorage.setItem(StorageService.countdown, this.datePipe.transform(this.endDate, 'yyyy-MM-dd HH:mm:ss'));
    sessionStorage.setItem(StorageService.selectedSeats, JSON.stringify(this.selectedSeats));
    sessionStorage.setItem(StorageService.orderTotal, this.total.toString());
  }
  removePage()
  {
    sessionStorage.removeItem(StorageService.bookingInfo);
    sessionStorage.removeItem(StorageService.callbackUrl);
    sessionStorage.removeItem(StorageService.countdown);
    sessionStorage.removeItem(StorageService.selectedSeats);
    sessionStorage.removeItem(StorageService.orderTotal);
  }
}
