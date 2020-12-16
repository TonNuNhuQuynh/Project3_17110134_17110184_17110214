import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from 'app/api.service';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { AddAdminModalComponent } from 'app/shared/add-admin-modal/add-admin-modal.component';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Role } from './model';
import { Account } from './model';
import { RolesService } from './roles.service';

@Component({
  selector: 'app-manage-accounts',
  templateUrl: './manage-accounts.component.html',
  styleUrls: ['./manage-accounts.component.css']
})
export class ManageAccountsComponent implements OnInit, OnDestroy {

  constructor(private modalService: NgbModal, private toastr: ToastrService, 
              private http: HttpClient, private apiService: ApiService, 
              private auth: AuthenticationService, private chRef : ChangeDetectorRef,) { }
  
  ngOnDestroy(): void 
  {
    this.dtTrigger.unsubscribe();
  }
  accounts: Account[] = [];
  filterAccounts: Account[] = [];
  roles: Role[] = [];
  rSelectAll: string = 'Loại người dùng';

  roleName: string = 'Tất cả';
  isSuperAdmin: boolean = false;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  async ngOnInit(): Promise<void> 
  {
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu: [10, 15, 20],
      autoWidth: true };
    
    if (this.auth.currentAccountValue.roleName == RolesService.superAdmin) this.isSuperAdmin = true;
    await this.getRoles();
    await this.getAccounts();

    let temp: Account[] = [];
    temp = this.roleName != 'Tất cả' ? this.accounts.filter(a => a.roleName == this.roleName): this.accounts;
    this.filterAccounts = temp;
  
    this.chRef.detectChanges();
    this.dtTrigger.next();

    
    //this.roleId = this.roles.length + 1;
  }
  getImageMime(base64: string): string
  {
    if (base64.charAt(0)=='/') return 'jpg';
    else if (base64.charAt(0)=='R') return "gif";
    else if(base64.charAt(0)=='i') return 'png';
    else return 'jpeg';
  }
  getImageSource(base64: string): string
  {
    return `data:image/${this.getImageMime(base64)};base64,${base64}`; 
  }
  async getAccounts()
  {
    let url = this.apiService.backendHost + "/api/Accounts";
    this.accounts =  await this.http.get<Account[]>(url).toPromise();
    this.accounts = this.accounts.filter(a => a.username != this.auth.currentAccountValue.username);
  }
  async getRoles()
  {
    let url = this.apiService.backendHost + "/api/Roles";
    this.roles =  await this.http.get<Role[]>(url).toPromise();
    this.roles = this.roles.filter (r => r.name != this.auth.currentAccountValue.roleName);
    if (!this.isSuperAdmin) 
    {
      this.roles = [this.roles[0]];
      this.roleName = RolesService.user;
    }
  }
  rerender() 
  {
    this.dtElement.dtInstance.then((dtInstance : DataTables.Api) => 
    {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
  filterRoles(value: number, text: string)
  {
    this.roleName = this.roles.length == 1 || value > this.roles.length? 'Tất cả': text;
    if (this.roles.length == 1 || value > this.roles.length) this.rSelectAll = 'Loại người dùng'; 
    else this.rSelectAll = text;
    if (this.roles.length > 1) this.filter();
  }
  filter()
  {
    let temp: Account[] = [];
    temp = this.roleName != 'Tất cả' ? this.accounts.filter(a => a.roleName == this.roleName): this.accounts;
    this.filterAccounts = temp;  
    this.rerender();
  }
  toastSuccess(msg: string)
  {
    this.toastr.success(msg, '', {
      closeButton: true,
      timeOut: 3000
    });
  }
  toastError(msg: string)
  {
    this.toastr.error(msg, '', {
      closeButton: true,
      timeOut: 3000
    });
  }
  async block(id: number)
  {
    let account: Account = this.filterAccounts.find(a => a.id == id);
    var r = confirm(`Bạn có chắc muốn khóa tài khoản '${account.username}' không?`);
    if (r)
    {
      account.isActive = false;
      let headers: any = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      let url = this.apiService.backendHost + `/api/Accounts/Block/${id}`;
      try 
      {
        let result = await this.http.put(url, account, headers).toPromise();
        this.toastSuccess('Block tài khoản thành công!');
      } 
      catch(e) 
      {
        this.toastError('Block tài khoản không thành công!')
      }

    }

  }
  async unBlock(id: number)
  {
    let account: Account = this.filterAccounts.find(a => a.id == id);
    var r = confirm(`Bạn có chắc muốn kích hoạt tài khoản '${account.username}' không?`);
    if (r)
    {
      account.isActive = true;
      let headers: any = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      let url = this.apiService.backendHost + `/api/Accounts/Block/${id}`;
      try 
      {
        let result = await this.http.put(url, account, headers).toPromise();
        this.toastSuccess('Kích hoạt tài khoản thành công!');
      } 
      catch(e) 
      {
        this.toastError('Kích hoạt tài khoản không thành công!')
      }
    }

  }

  async deleteAccount(id: number)
  {
    let account: Account = this.filterAccounts.find(a => a.id == id);
    var r = confirm(`Bạn có chắc muốn xóa tài khoản '${account.username}' không? Dữ liệu hoạt động của tài khoản này sẽ mất hết`);
    if (r)
    {
      let url = this.apiService.backendHost + `/api/Accounts/${id}`;
      try 
      {
        let result = await this.http.delete(url).toPromise();
        if (result) 
        {
          this.toastSuccess('Xóa tài khoản thành công!');
          this.accounts = this.accounts.filter(a => a.id != id);
          this.filter();
        }
      } 
      catch(e) 
      {
        this.toastError('Xóa tài khoản không thành công!')
      }
    }

  }
  openAddAdminModal()
  {
    const modalRef = this.modalService.open(AddAdminModalComponent, {backdrop: 'static', keyboard: false});

    modalRef.result.then(async (result: any) => 
    {
      if (typeof(result) == 'object') 
      {
        this.accounts.push(result);
        console.log(this.accounts.length)
        this.filter();
        this.toastSuccess('Thêm tài khoản Admin thành công!');
      }
      else if (result == 'Failed') this.toastError('Thêm tài khoản không thành công!');
    }, (reason: any) => {})
  }
}
