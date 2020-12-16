import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { Account } from 'app/manage-accounts/model';
import { RolesService } from 'app/manage-accounts/roles.service';

@Component({
  selector: 'app-add-admin-modal',
  templateUrl: './add-admin-modal.component.html',
  styleUrls: ['./add-admin-modal.component.css']
})
export class AddAdminModalComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private http: HttpClient, private apiService: ApiService) { }

  account: Account;
  showAlert: boolean = false;
  alertMessage: string = '';
  loaded: boolean = true;

  ngOnInit(): void 
  {
    this.account = {
      id: 0,
      username: '',
      password: '',
      email: '',
      phone: null,
      roleName: RolesService.admin,
      isActive: true,
      user: {
        fullname: '',
        area: null,
        image: null,
        accountId: 0
      }
    }
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
  private createHeader(): any {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' };
  }
  async addAccount()
  {
    let url = this.apiService.backendHost + `/api/Accounts/Admin`;
    try 
    {
      this.loaded = false;
      let result = await this.http.post<string>(url, this.account, this.createHeader()).toPromise() as any;
      if (result == 'username') this.setAlert("Username đã được sử dụng!");
      else if (result == 'email') this.setAlert("Email đã được sử dụng!");
      else if (result == 'username,email') this.setAlert("Username và Email đã được sử dụng!");
      else 
      {
        this.account.id = Number(result);
        this.closeAlert(this.account);
      }
      this.loaded = true;
    } 
    catch(e) 
    {
      console.log(e);
      this.closeAlert('Failed');
    }
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
}
