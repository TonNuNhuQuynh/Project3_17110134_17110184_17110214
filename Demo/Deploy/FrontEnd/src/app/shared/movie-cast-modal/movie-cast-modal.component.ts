import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { Cast } from '../movie-modal/model';

@Component({
  selector: 'app-movie-cast-modal',
  templateUrl: './movie-cast-modal.component.html',
  styleUrls: ['./movie-cast-modal.component.css']
})
export class MovieCastModalComponent implements OnInit {

  constructor(private http: HttpClient, private apiService: ApiService, public activeModal: NgbActiveModal) { }

  @Input() movieId: number;
  casts: Cast[];
  cast: Cast;
  class: string = 'success';
  btnText: string = 'Thêm diễn viên';
  allowCancel: boolean = false;
  icon: string = 'plus-circle';

  existed: boolean = false;

  alertMessage: string = '';
  showAlert: boolean = false;
  loaded: boolean = true;

  async ngOnInit(): Promise<void> 
  {
    this.casts = [];
    this.cast = {name: '', character: '', movieId: this.movieId};
    let input_group = document.getElementsByClassName('input-group');
    for (let i = 0; i < input_group.length; i++) {
        input_group[i].children[1].addEventListener('focus', function (){
            input_group[i].classList.add('input-group-focus');
        });
        input_group[i].children[1].addEventListener('blur', function (){
            input_group[i].classList.remove('input-group-focus');
        });
    }

    await this.getCasts();
  }
  async getCasts()
  {
    let url = this.apiService.backendHost + `/api/Casts/${this.movieId}`;
    this.casts = await this.http.get<Cast[]>(url).toPromise();
  }
  closeAlert()
  {
    //this.showAlert = false;
    this.activeModal.close('Close');
  }
  setButton(cls: string, text: string, icon: string, allow: boolean)
  {
    this.class = cls;
    this.btnText = text;
    this.icon = icon;
    this.allowCancel = allow;
  }
  editCast(c: Cast)
  {
    this.cast.name = c.name;
    this.cast.character = c.character;

    this.setButton('primary', 'Cập nhật', 'save', true);
    document.getElementById("form").scrollIntoView({behavior: 'smooth'});
  }
  cancel()
  {
    // this.cast.name = '';
    // this.cast.character = '';
    this.setButton('success', 'Thêm diễn viên', 'plus-circle', false);
  }
  scrollToRow(id: string)
  {
    setTimeout(function() 
    {
      document.getElementById(id).scrollIntoView();
    }, 2000);
    
  }
  setAlert(msg: string)
  {
    this.showAlert = true;
    this.alertMessage = msg;
    var _this = this;
    setTimeout(function() 
    {
      _this.showAlert = false;
    }, 3000);
  }
  save()
  {
    if (this.class == 'success')
    {
      if (this.casts.find(c => c.name == this.cast.name)) 
      {
        this.existed = true;
        var _this = this;
        setTimeout(function() {_this.existed = false}, 3000);
      }
      else 
      {
        this.casts.push(this.cast);
        this.cancel();
        this.setAlert('Đã thêm diễn viên!');
      }
    }
    else
    {
      let element: Cast = this.casts.find(c => c.name == this.cast.name);
      element.name = this.cast.name;
      element.character = this.cast.character;
      this.cancel();
      this.setAlert('Đã cập nhật thay đổi!');
    }   
  }
  async saveChanges()
  {
    this.loaded = false;
    try 
    {
      let headers: any = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      let url = this.apiService.backendHost + `/api/Casts/${this.cast.movieId}`;
      let result = await this.http.put(url, this.casts, headers).toPromise();
      this.loaded = true;
      if (result) this.activeModal.close('Success');
    }
    catch (e)
    {
      console.log(e)
      this.activeModal.close('Error');
    }   
  }
  deleteCast(name: string)
  {
    this.casts = this.casts.filter(c => c.name != name);
  }
}
