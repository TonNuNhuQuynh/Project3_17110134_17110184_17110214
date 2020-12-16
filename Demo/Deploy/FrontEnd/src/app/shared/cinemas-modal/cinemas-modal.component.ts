import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { CinemaVM } from 'app/manage-chains/model';

@Component({
  selector: 'app-cinemas-modal',
  templateUrl: './cinemas-modal.component.html',
  styleUrls: ['./cinemas-modal.component.css']
})
export class CinemasModalComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private http: HttpClient, private apiService: ApiService) { }

  cinemas: CinemaVM[];
  filterCinemas: CinemaVM[] = [];
  isLoaded: boolean = false;
  key: string = '';
  @Input() cityId: number = 0;
  @Input() cityName: string = '';


  async ngOnInit(): Promise<void> 
  {
    await this.getCinemas();
    this.filterCinemas = this.cinemas;
    this.isLoaded = true;
  }
  async getCinemas()
  {
    let url = this.apiService.backendHost + `/api/Cinemas/City/${this.cityId}`;
    this.cinemas = await this.http.get<CinemaVM[]>(url).toPromise();
  }

  closeModal(result: any)
  {
    this.activeModal.close(result);
  }
  searchCinemas()
  {
    if (this.key.length == 0) this.filterCinemas = this.cinemas;
    else this.filterCinemas = this.cinemas.filter(c => c.name.toLowerCase().includes(this.key.toLowerCase()));
  }
  
}
