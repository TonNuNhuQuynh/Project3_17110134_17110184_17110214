import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { Cinema } from 'app/manage-chains/model';

@Component({
  selector: 'app-edit-cinema-modal',
  templateUrl: './edit-cinema-modal.component.html',
  styleUrls: ['./edit-cinema-modal.component.css']
})
export class EditCinemaModalComponent implements OnInit {

  constructor(private activeModal: NgbActiveModal, private http: HttpClient, private apiService: ApiService) { }

  @Input() cinema: Cinema;
  lat: number;
  long: number;
  loaded: boolean = true;
  
  ngOnInit(): void 
  {
    this.lat = Number(this.cinema.location.split(";")[0])
    this.long = Number(this.cinema.location.split(";")[1])

    let input_group = document.getElementsByClassName('input-group');
    for (let i = 0; i < input_group.length; i++) {
        input_group[i].children[1].addEventListener('focus', function (){
            input_group[i].classList.add('input-group-focus');
        });
        input_group[i].children[1].addEventListener('blur', function (){
            input_group[i].classList.remove('input-group-focus');
        });
    }
  }
  closeAlert(result: any)
  {
    this.activeModal.close(result);
  }
  async editCinema()
  {
    this.cinema.location = this.lat.toString() + ";" + this.long.toString();
    try 
    {
      this.loaded = false;
      let headers: any = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      let url = this.apiService.backendHost + `/api/Cinemas/${this.cinema.id}`;
      let result = await this.http.put(url, this.cinema, headers).toPromise();
      if (result) this.closeAlert(this.cinema);
    }
    catch(e) 
    {
      console.log(e);
      this.closeAlert('Failed');
    }
    
  }
}
