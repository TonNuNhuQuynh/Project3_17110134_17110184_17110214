import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'app/api.service';
import { ToastService } from 'app/toast/toast.service';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css']
})
export class SendEmailComponent implements OnInit {

  email: string = '';
  success: boolean = false;
  isLoaded: boolean = false;
  constructor(private router: Router, private http: HttpClient, private apiService: ApiService, private toast: ToastService) { }

  ngOnInit(): void 
  {

  }
  async send()
  {
    this.isLoaded = true;
    let url = this.apiService.backendHost + `/api/Accounts/SendEmailResetPassword?email=${this.email}`;
    try 
    {
      let result = await this.http.get<any>(url).toPromise() as any;
      if (result == null) this.toast.toastError('Email chưa được đăng ký!');
      else this.fadeOut();
    } 
    catch(e) 
    {
      console.log(e);
      this.toast.toastError('Gửi email không thành công!');
    }
    this.isLoaded = false;
  }
  fadeOut()
  {
    var _this = this;
    $('#form').fadeOut(1000, function() {
      _this.success = true;
    });
  }
}
