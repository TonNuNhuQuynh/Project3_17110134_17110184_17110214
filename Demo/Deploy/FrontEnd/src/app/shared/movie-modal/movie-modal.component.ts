import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/api.service';
import { Cast, Movie } from './model';


@Component({
  selector: 'app-movie-modal',
  templateUrl: './movie-modal.component.html',
  styleUrls: ['./movie-modal.component.css']
})
export class MovieModalComponent implements OnInit{

  @Input() movie: any;
  @Input() name: string;
  
  constructor(private http: HttpClient, public activeModal: NgbActiveModal, private apiService: ApiService) { }
  focus: boolean;

  genres: any[];
  languages: any[];
  statuses: any[];

  localFields: Object = { text: 'name', value: 'id' };
  mode: string;
  selectAllText: string;

  movieInDB: Movie;
  releaseDateNgb: NgbDateStruct;
  showAlert: boolean = false;
  alertType: string;
  alertMessage: string = '';

  result: string = 'Close';
  invalidDate: boolean = false;

  loaded: boolean = true;
  async ngOnInit(): Promise<void> 
  {
    this.focus = false;
    this.genres = [];
    this.languages = [];
    this.statuses = [];
    this.mode = 'CheckBox';
    this.selectAllText = 'Select All';

    this.movieInDB = {
      id: this.movie.id,
      originalTitle: this.movie.originalTitle,
      title: this.movie.title,
      plot: this.movie.plot,
      directors: this.movie.directors,
      producers: this.movie.producers,
      releaseDate: this.convertToDate(this.movie.releaseDate),
      runtime: this.movie.runtime,
      ageRating: this.movie.ageRating,
      poster: this.movie.poster,
      backdrop: this.movie.backdrop,
      trailer: this.movie.trailer,
      languageId: this.movie.languageId,
      movieStatusId: this.movie.movieStatusId,
      genres: [],
      casts: this.movie.casts,
      accountId: this.movie.accountId,
      createdDate: this.movie.createdDate
    }
    this.releaseDateNgb = {day: this.movieInDB.releaseDate.getDate(), month: this.movieInDB.releaseDate.getMonth() + 1, year: this.movieInDB.releaseDate.getFullYear()}

    await this.getLanguages();
    await this.getStatuses();
    await this.getCrews();
    await this.getGenres();
    this.movieInDB.genres = this.movie.genres;

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
  convertToDate(str: string): Date
  {
    let date = str.split('-');
    return new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]));
  }

  async getGenres()
  {
    let url = this.apiService.backendHost + "/api/Genres";
    this.genres = await this.http.get<any>(url).toPromise();
  }
  async getLanguages()
  {
    let url = this.apiService.backendHost + "/api/Languages";
    this.languages = await this.http.get<any>(url).toPromise();
  }
  async getStatuses()
  {
    let url = this.apiService.backendHost + "/api/MovieStatus";
    this.statuses = await this.http.get<any>(url).toPromise();
  }
  async getCrews()
  {
    if (this.movieInDB.directors == '' && this.movieInDB.producers == '' && this.movieInDB.casts.length == 0)
    {
      let url = `https://api.themoviedb.org/3/movie/${this.movieInDB.id}/credits?api_key=${this.apiService.api_key}`;
      let result = await this.http.get<any>(url).toPromise();

      for (let i = 0; i < 5; i++) {
        const element = result.cast[i];
        let cast: Cast = {name: element.name, character: element.character, movieId: this.movieInDB.id};
        this.movieInDB.casts.push(cast);
      }

      let count1 = 0;
      let count2 = 0;

      for (let i = 0; i < result.crew.length; i++) 
      {
        const element = result.crew[i];
        if (element.department == 'Directing') 
        {
          count1 ++ ;
          this.movieInDB.directors += element.name + ", ";
          if (count1 == 2) break;
        }
      }

      for (let i = 0; i < result.crew.length; i++) 
      {
        const element = result.crew[i];
        if (element.department == 'Production' && element.job == 'Producer') 
        {
          this.movieInDB.producers += element.name + ", ";
          count2 ++;
          if (count2 == 3) break;
        }
      }

      this.movieInDB.directors = this.movieInDB.directors.substr(0, this.movieInDB.directors.length - 2);
      this.movieInDB.producers = this.movieInDB.producers.substr(0, this.movieInDB.producers.length - 2);
    }
  }
  async saveMovie()
  {
    this.loaded = false;
    if (this.name.includes('Thêm')) await this.addMovie();
    else await this.updateMovie();
    this.loaded = true;
  }
  async updateMovie()
  {
    try 
    {
      let headers: any = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      let url = this.apiService.backendHost + `/api/Movies/${this.movieInDB.id}`;
      let result = await this.http.put(url, this.movieInDB, headers).toPromise();
      
      if (result) this.activeModal.close(this.movieInDB)
    }
    catch (e)
    {
      this.alertMessage = "Cập nhật phim không thành công! Thử lại"
      this.alertType = "danger";
      this.showAlert = true;
      document.getElementById("alertDiv").scrollIntoView();

      var _this = this;
      setTimeout(function(){
        _this.showAlert = false;
      },3000);

    }      
  }
  async addMovie()
  {
    try 
    {
      let url = this.apiService.backendHost + "/api/Movies";
      let result = await this.http.post(url, this.movieInDB).toPromise();
 
      if (result)
      {
        this.result = 'Success';
        this.closeAlert();
      }
    }
    catch (e)
    {
      this.result = 'Failed';
      this.closeAlert();
    }      
  }
  closeAlert()
  {
    this.showAlert = false;
    this.activeModal.close(this.result);
  }
  dateChange(event: any)
  {
    if (typeof(event) == 'string') this.invalidDate = true;
    else this.invalidDate = false;
  }
}
