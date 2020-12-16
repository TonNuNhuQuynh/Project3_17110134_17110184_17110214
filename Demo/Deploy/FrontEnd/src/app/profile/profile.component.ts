import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgForm } from '@angular/forms';
import { ApiService } from 'app/api.service';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { Account} from 'app/manage-accounts/model';
import { City } from 'app/manage-chains/model';
import { ToastService } from 'app/toast/toast.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{

  account: Account;
  fileName: string = 'Ảnh đại diện';
  color: string = 'rgb(179, 178, 178)';
  file: File;
  formatError: boolean = false;
  cities: City[] = [];
  
  currentPass: string = '';
  newPass: string = '';
  confirmPass: string = '';
  showAlert: boolean = false;
  localFields: Object = { text: 'name', value: 'name' };
  downloadURL: Observable<string>;
  isLoaded: boolean = true;
  isLoaded2: boolean = true;

  @ViewChild('form', {static: false}) form: NgForm;
  constructor(private storage: AngularFireStorage, private toast: ToastService, private http: HttpClient, private apiService: ApiService, private auth: AuthenticationService) { }
  
  async ngOnInit(): Promise<void> 
  {
    this.account = {
      id: 0,
      username: '',
      password: '',
      email: '',
      phone: '',
      roleName: "",
      user: {image: '', area: '', fullname: '', accountId: 0},
      isActive: true
    }
    await this.getUser();
    await this.getCities();

    let input_group = document.getElementsByClassName('input-group');
    for (let i = 0; i < input_group.length; i++) {
        input_group[i].children[1].addEventListener('focus', function (){
            input_group[i].classList.add('input-group-focus');
        });
        input_group[i].children[1].addEventListener('blur', function (){
            input_group[i].classList.remove('input-group-focus');
        });
    }

    var _this = this;
    $(document).on('change', '#customFile', function(event)
    {
      _this.fileName = event.target.files[0].name;
      _this.color = '#66615b';
      // $(this).next('.custom-file-label').html(event.target.files[0].name);
      // $(this).next('.custom-file-label').css("color", "#66615b");
    })
  }
  async getUser()
  {
    let url = this.apiService.backendHost + `/api/Accounts/${this.auth.currentAccountValue.id}`;
    this.account = await this.http.get<Account>(url).toPromise();
  }
  
  pickFile(files: FileList)
  {
    var extension = files.item(0).name.split('.')[1];
    if (extension == 'jpg' || extension == 'png' || extension == 'jpeg')
    {
      this.file = files.item(0);
      this.formatError = false;
    }
    else this.formatError = true;
  }
  async getCities()
  {
    let url = this.apiService.cinemaChainHost + "/api/Cities";
    this.cities =  await this.http.get<City[]>(url).toPromise();
  }
  
  async putUser()
  {
    this.isLoaded = false;
    try 
    {
      // const formData: FormData = new FormData();
      // formData.append('image', this.file);
      // formData.append('id', this.account.id.toString());
      // formData.append('username', this.account.username);
      // formData.append('email', this.account.email);
      // formData.append('password', "");
      // formData.append('phone', this.account.phone);
      // formData.append('user', JSON.stringify(this.account.user));
      const filePath = `user-images/${this.auth.currentAccountValue.id}.${this.file.name.split('.')[1]}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.file);
      task.snapshotChanges()
        .pipe(
          finalize(() => {
            this.downloadURL = fileRef.getDownloadURL();
            this.downloadURL.subscribe(async imgUrl => {
              if (imgUrl)
              {
                this.account.user.image = imgUrl;
                console.log(imgUrl)
                let url = this.apiService.backendHost + `/api/Accounts/${this.account.id}`;      
                let r: Account = await this.http.put<Account>(url, this.account).toPromise();
                if (r)
                {
                  this.toast.toastSuccess("Cập nhật thông tin tài khoản thành công!");
                  this.account = r;
                  this.auth.updateProfilePic(r.user.image);
                }
              }
            });
          })
        )
        .subscribe();
    }
    catch (e) 
    {
      console.log(e);
      this.toast.toastError("Cập nhật thông tin tài khoản không thành công!")
    }
    this.isLoaded = true;
  }
  
  tabChange()
  {
    this.fileName = 'Ảnh đại diện';
    this.color = 'rgb(179, 178, 178)';
    this.formatError = false;
    this.resetPasswords();
  }
  resetPasswords()
  {
    this.currentPass = '';
    this.newPass = '';
    this.confirmPass = '';
    this.showAlert = false;

    this.form.form.markAsPristine();
    this.form.form.markAsUntouched();
  }
  setAlert()
  {
    this.showAlert = true;
    var _this = this;
    setTimeout(function() 
    {
      _this.showAlert = false;
    }, 4000);
  }
  private createHeader(): any {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' };
  }
  async changePassword()
  {
    this.isLoaded2 = false
    try 
    {
      let url = this.apiService.backendHost + `/api/Accounts/Password/${this.account.id}`;      
      let r = await this.http.put<string>(url, {currentPassword: this.currentPass, newPassword: this.newPass}, this.createHeader()).toPromise() as any;
      if (r.includes("Success")) 
      {
        this.toast.toastSuccess("Đổi mật khẩu thành công!");
        this.showAlert = false;
        this.resetPasswords();
      }
      else {
        this.setAlert();
      }
    }
    catch (e) 
    {
      console.log(e);
    }
    this.isLoaded2 = true;
  }
}
