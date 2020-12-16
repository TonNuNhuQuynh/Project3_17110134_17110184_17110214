import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'app/api.service';
import { Account } from 'app/manage-accounts/model';
import { ToastService } from 'app/toast/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  focus: boolean;
  focus1: boolean;
  focus2: boolean;
  focus3: boolean;

  account: Account;
  confirmPass: string = '';
  constructor(private router: Router, private toast: ToastService, private http: HttpClient, private apiService: ApiService) 
  { }

  ngOnInit(): void 
  {
    this.account = {
      id: 0,
      username: '',
      password: '',
      email: '',
      phone: null,
      roleName: "User",
      user: {image: null, area: null, fullname: null, accountId: 0},
      isActive: false
    }

    // let input_group = document.getElementsByClassName('input-group');
    // for (let i = 0; i < input_group.length; i++) {
    //     input_group[i].children[1].addEventListener('focus', function (){
    //         input_group[i].classList.add('input-group-focus');
    //     });
    //     input_group[i].children[1].addEventListener('blur', function (){
    //         input_group[i].classList.remove('input-group-focus');
    //     });
    // }   
  }
  private createHeader(): any {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' };
  }
  async register()
  {
    let url = this.apiService.backendHost + `/api/Accounts`;
    try 
    {
      let result = await this.http.post<string>(url, this.account, this.createHeader()).toPromise() as any;
      if (result == 'username') this.toast.toastError("Username đã được sử dụng!");
      else if (result == 'email') this.toast.toastError("Email đã được sử dụng!");
      else if (result == 'username,email') this.toast.toastError("Username và Email đã được sử dụng!");
      else this.router.navigate(['/verify']);
    } 
    catch(e) 
    {
      console.log(e);
      this.toast.toastError('Đăng kí tài khoản không thành công!');
    }
  }

}
