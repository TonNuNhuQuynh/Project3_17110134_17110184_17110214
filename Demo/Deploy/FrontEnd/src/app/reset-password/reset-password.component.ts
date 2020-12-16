import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'app/api.service';
import { ResetPasswordVM } from './model';
import { Location } from '@angular/common'
import { ToastService } from 'app/toast/toast.service';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  constructor(private toast: ToastService, private location: Location, private route: ActivatedRoute, private router: Router, private http: HttpClient, private apiService: ApiService) { }
  reset: ResetPasswordVM = {accountId: 0, code: null, password: ''};
  confirmPass: string = '';
  success: boolean = false;
  isLoaded: boolean = false;

  ngOnInit(): void 
  {
    this.route.queryParams.subscribe(params => {
      this.reset.accountId = params["userId"] || 0;
      this.reset.code = params["code"] || null;
      if (this.reset.code == null) this.location.back();
    });
  }
  async resetPass()
  {
    this.isLoaded = true;
    let url = this.apiService.backendHost + `/api/Accounts/ResetPassword`;
    try 
    {
      let result = await this.http.post<any>(url, this.reset).toPromise() as any;
      console.log(result);
      if (result != 'Success') this.toast.toastError('Đặt lại mật khẩu không thành công!');
      else 
      {
        this.success = true;
        this.toast.toastSuccess('Đặt lại mật khẩu thành công!');
      }
    } 
    catch(e) 
    {
      console.log(e);
      this.toast.toastError('Đặt lại mật khẩu không thành công!');
    }
    this.isLoaded = false;
  }

}
