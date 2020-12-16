import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { Cinema, CinemaChain } from '../model';

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.css']
})
export class WaitingComponent implements OnInit, AfterViewInit {

  constructor(private activeModal: NgbActiveModal, private http: HttpClient, private apiService: ApiService) { }
  updated: boolean = false;
  
  async ngAfterViewInit(): Promise<void> 
  {
    let chainIds = [];
    let cinemaIds = [];
    this.cinemaChainsInDB.forEach(chain => 
      {
        chainIds.push(chain.id)
        chain.cinemas.forEach(cinema => cinemaIds.push(cinema.id));
      });

    let url = this.apiService.cinemaChainHost + '/api/Cinemas';
    try
    {
      let result = await this.http.get<Cinema[]>(url).toPromise(); 
      let newCinemas = result.filter(cinema => cinemaIds.indexOf(cinema.id) == -1 && chainIds.indexOf(cinema.cinemaChainId) > -1);
      var _this = this
      
      if (newCinemas != null && newCinemas.length > 0) 
      {
        setTimeout( function(){ _this.activeModal.close(newCinemas) }, 3000);
      }
      else
      {   
        $('#fadeOut').fadeOut(1000, function(){
          _this.updated = true;
          setTimeout( function(){        
            _this.activeModal.dismiss();
          }, 2500);
        })
      }
    }
    catch(e)
    {
      console.log(e)
      this.activeModal.dismiss('error');
    }
    
  }
  @Input() cinemaChainsInDB: CinemaChain[];

  ngOnInit(): void
  {
    
  }

}
