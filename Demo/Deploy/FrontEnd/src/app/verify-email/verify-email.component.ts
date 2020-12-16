import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/api.service';
import { ToastService } from 'app/toast/toast.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {

  constructor(private toast: ToastService, private route: ActivatedRoute, private http: HttpClient, private apiService: ApiService) 
  { }

  accountId: number;
  code: string;
  success: boolean = false;
  isLoaded: boolean = false;

  ngOnInit(): void 
  {
    this.route.queryParams.subscribe(params => {
      this.accountId = params["userId"] || 0;
      this.code = params["code"] || null;
    });
  }
  private createHeader(): any {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' };
  }
  async confirm()
  {
    this.isLoaded = true;
    let url = this.apiService.backendHost + `/api/Accounts/ConfirmEmail`;
    try 
    {
      let result = await this.http.post<string>(url, {accountId: this.accountId, code: this.code}, this.createHeader()).toPromise() as any;
      if (result == null) this.toast.toastError('Email đã được xác nhận rồi!');
      else if (result != null && result != 'Success') this.toast.toastError('Xác nhận email không thành công!');
      else this.toast.toastSuccess('Xác nhận email thành công!');
      this.success = true;
    } 
    catch(e) 
    {
      console.log(e);
      this.success = true;
      this.toast.toastError('Xác nhận email không thành công!');
    }
    
  }
  // openLoginModal()
  // {
  //   const modalRef = this.modalService.open(LoginModalComponent, {windowClass: "login"});
  //   modalRef.result.then(async (result: any) => 
  //   {}, (reason: any) => {})
  // }
}
