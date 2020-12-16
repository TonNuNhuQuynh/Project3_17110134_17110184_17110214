import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { Cinema, CinemaVM } from '../model';

@Component({
  selector: 'app-updates',
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.css']
})
export class UpdatesComponent implements OnInit {

  constructor(private activeModal: NgbActiveModal, private http: HttpClient, private apiService: ApiService) { }
  @Input() cinemas: CinemaVM[];
  
  //cinemaVMs: CinemaVM[] = [];

  ngOnInit(): void 
  {
    
  }
  // initCinemas()
  // {
  //   // let url = this.apiService.backendHost + '/api/Cinemas';
  //   this.cinemas.forEach(element => {
  //     let cinema: CinemaVM = {id: element.id, name: element.name, logo: this.logo, address: element.address, cinemaChainId: this.chainId};
  //     this.cinemaVMs.push(cinema);
  //   });
  // }
  
  closeAlert(result: string)
  {
    this.activeModal.close(result);
  }
}
