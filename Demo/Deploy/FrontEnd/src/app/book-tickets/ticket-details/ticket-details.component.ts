import { ChangeDetectorRef, Component, OnInit, AfterContentChecked } from '@angular/core';
import { Router } from '@angular/router';
import { BookingInfo } from '../model';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit, AfterContentChecked {

  constructor(private router: Router, private chRef: ChangeDetectorRef) { }

  bookingInfo: BookingInfo;
  redirectUrl: string;

  ngAfterContentChecked(): void 
  {
    this.chRef.detectChanges();
  }

  ngOnInit(): void 
  {

  }
  redirect()
  {
    this.router.navigateByUrl(this.redirectUrl);
  }
}
