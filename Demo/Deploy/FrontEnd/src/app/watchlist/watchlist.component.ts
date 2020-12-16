import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/api.service';
import { AuthenticationService } from 'app/authentication/authentication.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  constructor(private http: HttpClient, private apiService: ApiService, private auth: AuthenticationService) { }
  watchlist: any[] = [];
  orders: any[] = [];

  isLoaded: boolean = false;
  isLoaded2: boolean = false;

  async ngOnInit(): Promise<void> 
  {
    await this.getWatchlist();
    this.isLoaded = true;

    await this.getOrders();
    this.isLoaded2 = true;
  }
  async getWatchlist()
  {
    let url = this.apiService.backendHost + `/api/Movies/Watchlist/${this.auth.currentAccountValue.id}`;
    this.watchlist = await this.http.get<any[]>(url).toPromise();
  }

  async getOrders()
  {
    let url = this.apiService.backendHost + `/api/Orders/${this.auth.currentAccountValue.id}`;
    this.orders = await this.http.get<any[]>(url).toPromise();
    console.log(this.orders)
  }
}
