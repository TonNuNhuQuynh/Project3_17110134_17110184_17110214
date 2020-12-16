import { HttpClient } from '@angular/common/http';
import { Component, OnInit} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { EditCinemaModalComponent } from 'app/shared/edit-cinema-modal/edit-cinema-modal.component';
import { ToastService } from 'app/toast/toast.service';
import { Cinema, CinemaChain, CinemasInCity, CinemaVM, City } from './model';
import { UpdatesComponent } from './updates/updates.component';
import { WaitingComponent } from './waiting/waiting.component';

@Component({
  selector: 'app-manage-cinema-chains',
  templateUrl: './manage-cinema-chains.component.html',
  styleUrls: ['./manage-cinema-chains.component.css']
})
export class ManageCinemaChainsComponent implements OnInit{

  constructor(private modalService: NgbModal, private toast: ToastService, private http: HttpClient, private apiService: ApiService) { }

  cinemaChains: CinemaChain[] = [];
  cinemaChainsInDB: CinemaChain[] = [];
  cities: City[] = [];
  cinemasInCities: CinemasInCity[] = [];
  activeIds: string = '';

  dropdownTxt: string = 'Chọn chuỗi rạp';
  chainId: number = 0;
  isPicked: boolean = false;
  pickedChain: number = 0;
  loaded: boolean = false;

  newCinemas: Cinema[] = [];

  async ngOnInit(): Promise<void> 
  {
    await this.getCinemeChains();
    await this.getCinemeChainsFromMain();
    await this.getCities();
    this.loaded = true;

    $(document).on('click', '#list-tab .list-group-item', function() {
      $('.list-group-item.active').removeClass("active");
      $(this).addClass("active");
    });

    if (this.cinemaChainsInDB.length > 0) 
    {
      this.showChain(this.cinemaChainsInDB[0].id);
      await this.getUpdates();
    }

  }
  // toastSuccess(msg: string)
  // {
  //   this.toastr.success(msg, '', {
  //     closeButton: true,
  //     timeOut: 3000
  //   });
  // }
  // toastError(msg: string)
  // {
  //   this.toastr.error(msg, '', {
  //     closeButton: true,
  //     timeOut: 3000
  //   });
  // }
  async getCinemeChains()
  {
    let url = this.apiService.cinemaChainHost + "/api/CinemaChains";
    this.cinemaChains =  await this.http.get<CinemaChain[]>(url).toPromise();
  }
  async getCinemeChainsFromMain()
  {
    let url = this.apiService.backendHost + "/api/CinemaChains";
    this.cinemaChainsInDB =  await this.http.get<CinemaChain[]>(url).toPromise();
  }
  async getCities()
  {
    let url = this.apiService.cinemaChainHost + "/api/Cities";
    this.cities =  await this.http.get<City[]>(url).toPromise();
  }
  pickChain(id: number, name: string)
  {
    this.chainId = id;
    this.isPicked = true;
  }
  reset(id: number, name: string, picked: boolean)
  {
    this.isPicked = picked;
    this.dropdownTxt = name;
    this.chainId = id;
    console.log(this.chainId);
  }
  async addChain()
  {
    let chain = this.cinemaChainsInDB.find(c => c.id == this.chainId);
    if (chain) 
    {
      this.toast.toastError(`Chuỗi rạp '${chain.name}' đã có trong hệ thống!`);
      this.reset(0, 'Chọn chuỗi rạp', false);
    }
    else
    {
      this.loaded = false;
      let newChain = this.cinemaChains.find(c => c.id == this.chainId);
      try 
      {
        let url = this.apiService.backendHost + "/api/CinemaChains";
        let result =  await this.http.post<CinemaChain>(url, newChain).toPromise();
        this.cinemaChainsInDB.push(newChain);
        this.toast.toastSuccess('Thêm chuỗi rạp thành công');
      }
      catch(e)
      {
        console.log(e);
        this.toast.toastError('Thêm chuỗi rạp không thành công');
      }  
      this.loaded = true;    
    }
  }
  showChain (id: number)
  {
    this.cinemasInCities = [];
    // let Ids = [];
    this.pickedChain = id;
    let chain = this.cinemaChainsInDB.find(c => c.id == id);
    if (chain)
    {
      this.cities.forEach(city => {
        let area: CinemasInCity = {city: city, cinemas: []};
        let cinemas = chain.cinemas.filter(c => c.cityId == city.id);
        if (cinemas.length > 0) 
        {
          cinemas.forEach(e => {
            let r: CinemaVM = {id: e.id, name: e.name, address: e.address, logo: chain.logo, cinemaChainId: id};
            area.cinemas.push(r);
          });
        }
        if (area.cinemas.length > 0) {
          this.cinemasInCities.push(area);
          // Ids.push(area.city.id)
        }
      });
      // if  (Ids.length > 0) this.activeIds = Ids.toString();
    }
  }
  editCinema (id: number)
  {
    let cinema = this.cinemaChainsInDB.find(chain => chain.id == this.pickedChain).cinemas.find(cinema => cinema.id == id);
    const modalRef = this.modalService.open(EditCinemaModalComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.cinema = cinema;
    
    modalRef.result.then(async (result: any) => 
    {
      if (typeof(result) == 'object') 
      {
        cinema = result;
        this.toast.toastSuccess('Cập nhật thông tin rạp thành công!');
      }
      else if (result == 'Failed') this.toast.toastError('Cập nhật thông tin rạp không thành công!');
    }, (reason: any) => {})
  }
  async deleteChain(id: number)
  {
    let chain = this.cinemaChainsInDB.find(chain => chain.id == id);
    let r = confirm(`Bạn có chắc muốn xóa cụm rạp '${chain.name}' không?`);
    if (r)
    {
      this.loaded = false;
      try 
      {
        let url = this.apiService.backendHost + `/api/CinemaChains/${id}`;
        let result = await this.http.delete(url).toPromise();
        if (result) 
        {
          this.toast.toastSuccess('Xóa cụm rạp thành công!');
          this.cinemaChainsInDB = this.cinemaChainsInDB.filter(a => a.id != id);
          this.cinemasInCities = [];
        }
      }
      catch (e) { this.toast.toastError('Xóa cụm rạp không thành công!') }
      this.loaded = true;
    }
  }
  
  initCinemas(cinemas: Cinema[]): CinemaVM[]
  {
    let cinemaVMs: CinemaVM[] = [];
    cinemas.forEach(element => {
      let cinema: CinemaVM = {id: element.id, name: element.name, logo: this.cinemaChainsInDB.find(chain => chain.id == element.cinemaChainId).logo, address: element.address, cinemaChainId: element.cinemaChainId};
      cinemaVMs.push(cinema);
    });
    return cinemaVMs;
  }
  async postCinemas()
  {
    let url = this.apiService.backendHost + '/api/Cinemas';
    try
    {
      this.loaded = false;
      await this.http.post(url, this.newCinemas).toPromise();
      this.toast.toastSuccess('Thêm các rạp thành công!');
      this.newCinemas.forEach(cinema => {
        let chain = this.cinemaChainsInDB.find(chain => chain.id == cinema.cinemaChainId);
        chain.cinemas.push(cinema);
      });  
      this.loaded = true;
      if (this.cinemaChainsInDB.length > 0) this.showChain(this.cinemaChainsInDB[0].id);
    }
    catch(e)
    {
      this.loaded = true;
      this.toast.toastError('Thêm các rạp không thành công!');
    }
  }
  async getUpdates()
  {
    let waitingmodalRef = this.modalService.open(WaitingComponent, {size: 'sm', backdrop: 'static', keyboard: false} );
    waitingmodalRef.componentInstance.cinemaChainsInDB = this.cinemaChainsInDB;
    waitingmodalRef.result.then((result: any) => 
    {

      if (result != null) 
      {
        this.newCinemas = result;
        if (this.newCinemas.length > 0)
        {
          let modalRef = this.modalService.open(UpdatesComponent);
          modalRef.componentInstance.cinemas = this.initCinemas(this.newCinemas);

          modalRef.result.then(async (result: any) => 
          {
            if (result == 'Save') await this.postCinemas();
          }, (reason: any) => {})
        }
      }
    }, (reason: any) => {})

  }
  async deleteCinema(id: number, chainId: number)
  {
    let result = confirm('Bạn có chắc muốn xóa rạp này?')
    if (result)
    {
      let url = this.apiService.backendHost + `/api/Cinemas/${id}`;
      try
      {
        this.loaded = false;
        await this.http.delete(url).toPromise();
        this.toast.toastSuccess('Xóa rạp thành công!');
        let chain = this.cinemaChainsInDB.find(c => c.id == chainId);
        chain.cinemas = chain.cinemas.filter(c => c.id != id);
        this.showChain(chainId);
        this.loaded = true;
      }
      catch(e)
      {
        console.log(e);
        this.loaded = true;
        this.toast.toastError('Xóa rạp không thành công!')
      }
    }
  }
}
