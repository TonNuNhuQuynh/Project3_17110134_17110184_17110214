import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable} from "@angular/core";
import { ApiService } from "./api.service";
import { StorageService } from "./storage.service";

@Injectable({ providedIn: 'root'})
export class LocationService  
{

    public cities: any[] = [];
    url: string = 'https://ipinfo.io?token=';
    token: string = '1fc3528fac02b9';

    public cityStorage = StorageService.pickedCityStorage;
    public currentCity: any;
    

    constructor(private apiService: ApiService, private http: HttpClient)
    {
        if (sessionStorage.getItem(this.cityStorage)) 
        {
            this.currentCity = JSON.parse(sessionStorage.getItem(this.cityStorage));
            let url = this.apiService.cinemaChainHost + "/api/Cities";
            this.http.get<any[]>(url).subscribe(res => { this.cities = res }, err => { console.log(err) });
        }
        else 
        {
            var _this = this;
            $.getJSON(this.url + this.token)
            .done ( async function(location) 
            {
                let name = location.city
                await _this.getCities();
                if (name.includes('City')) name = name.substring(0, name.length - 5)
                let city = _this.cities.find(c => _this.cleanAccents(c.name.toLowerCase()).includes(name.toLowerCase()))
                _this.currentCity = city? city: {id: 0, name: ''};
                sessionStorage.setItem(_this.cityStorage, JSON.stringify(_this.currentCity));      

            }).catch(e => { console.log(e) }); 
        } 
    }
    
    createHeader(): HttpHeaders
    {
        let headers: any = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        return headers;
    }

    async getCities() 
    {
        let url = this.apiService.cinemaChainHost + "/api/Cities";
        this.cities =  await this.http.get<any[]>(url).toPromise();
    }
    public updateStorage(city: any)
    {
        this.currentCity = city;
        sessionStorage.setItem(this.cityStorage, JSON.stringify(this.currentCity));
    }
    cleanAccents = (str: string): string => {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");  
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); 
        return str;
    }
}