import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/api.service';
import { LocationService } from 'app/location.service';

@Component({
  selector: 'app-location-modal',
  templateUrl: './location-modal.component.html',
  styleUrls: ['./location-modal.component.css']
})
export class LocationModalComponent implements OnInit {

  constructor(private locationService: LocationService, private apiService: ApiService, private http: HttpClient) { }
  cities: any[] = [];
  filterCities: any[] = [];
  isLoaded: boolean = false;
  key: string = '';

  async ngOnInit(): Promise<void> 
  {
    
    let input_group = document.getElementsByClassName('input-group');
    for (let i = 0; i < input_group.length; i++) {
        input_group[i].children[0].addEventListener('focus', function (){
            input_group[i].classList.add('input-group-focus');
        });
        input_group[i].children[0].addEventListener('blur', function (){
            input_group[i].classList.remove('input-group-focus');
        });
    }
    // if (this.locationService.cities.length == 0) await this.getCities();
    // else
    // {
      
    // }
    if (this.locationService.cities.length > 0)
    {
      let city = this.locationService.cities[0];
      if (city['counts'] == undefined) await this.getCities();
      else this.cities = this.locationService.cities;
      this.filterCities = this.cities;
      this.isLoaded = true;
    }
  }
  pickLocation(city: any) 
  {
    this.locationService.updateStorage({id: city.id, name: city.name});
  }
  searchCities() 
  {
    if (this.key.length == 0) this.cities = this.cities;
    else this.filterCities = this.cities.filter(c => c.name.toLowerCase().includes(this.key.toLowerCase()));
  }
  async getCities()
  {
    let url = this.apiService.backendHost + "/api/Cinemas/CountByCity";
    this.cities =  await this.http.get<any[]>(url).toPromise();
    this.locationService.cities = this.cities;
  }
}
