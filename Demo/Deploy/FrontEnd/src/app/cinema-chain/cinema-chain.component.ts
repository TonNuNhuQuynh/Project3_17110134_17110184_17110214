import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'app/api.service';
import { CinemasInCity, CinemaVM } from 'app/manage-chains/model';
import { LocationService } from 'app/location.service';

@Component({
  selector: 'app-cinema-chain',
  templateUrl: './cinema-chain.component.html',
  styleUrls: ['./cinema-chain.component.css']
})
export class CinemaChainComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private apiService: ApiService, private locationService: LocationService) { }
  
  chainId: number = 0;
  chainName: string = '';
  cinemaCounts: number = 0;
  isLoaded: boolean = false;
  cinemasInCities: CinemasInCity[] = [];
  cityId: number = 0;
  cities: any[] = [];
  localFields: Object = { text: 'name', value: 'id' };

  async ngOnInit(): Promise<void> 
  {
    this.route.queryParams.subscribe(params => {
      this.chainId = params['chain'] || 0;
      if (this.chainId == 0) this.router.navigate(['/not-found']);
    });

    if (this.chainId != 0) await this.getCinemas();
  }
  async getCinemas()
  {
    let url = this.apiService.backendHost + `/api/Cinemas/Chain/${this.chainId}`;
    let result = await this.http.get<any>(url).toPromise();
    if (result == null) this.router.navigate(['/not-found']);
    
    this.chainName = result.cinemaChainName;
    let cinemas = result.cinemas;

    this.cinemaCounts = cinemas.length;
    this.locationService.cities.forEach(city => {
      let area: CinemasInCity = {city: {id: city.id, name: city.name}, cinemas: []};
      let cinemasInCity = cinemas.filter(c => c.cityId == city.id);
      if (cinemasInCity.length > 0) 
      {
        cinemasInCity.forEach(e => {
          let r: CinemaVM = {id: e.id, name: e.name, address: e.address, logo: '', cinemaChainId: 0};
          area.cinemas.push(r);
        });
      }
      if (area.cinemas.length > 0) 
      {
        this.cinemasInCities.push(area);
        this.cities.push(area.city);
      }
    });
    this.isLoaded = true;
  }
  onChange()
  {
    document.getElementById(`city-${this.cityId}`).scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
  }
}
