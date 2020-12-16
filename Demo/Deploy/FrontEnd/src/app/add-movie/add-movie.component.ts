import { Component, OnInit } from '@angular/core';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ApiService} from 'app/api.service';
import { DatePipe } from '@angular/common';
import { MovieModalComponent } from 'app/shared/movie-modal/movie-modal.component';
import { ToastService } from 'app/toast/toast.service';
import { AuthenticationService } from 'app/authentication/authentication.service';

@Component({
  selector: 'app-add-movie',
  templateUrl: './add-movie.component.html',
  styleUrls: ['./add-movie.component.css']
})
export class AddMovieComponent implements OnInit {

  constructor(private toastr: ToastService, private http: HttpClient, private apiService: ApiService, private datePipe: DatePipe, private modalService: NgbModal, private auth: AuthenticationService) { }

  focus: boolean;
  focus1: boolean;

  startDate: NgbDateStruct;
  endDate: NgbDateStruct;
  invalidStart: boolean;
  invalidEnd: boolean;
  disable: boolean;

  movies: any;
  page = 1;
  pageSize: number;
  collectionSize: number;
  search: string;
  fetchMode: string = 'upcoming';
  header: string;

  regionQuery = "US,KR,CN,VN";
  upcomingURL = `https://api.themoviedb.org/3/movie/upcoming?language=en-US&region=${this.regionQuery}&api_key=${this.apiService.api_key}`;
  filterURL = `https://api.themoviedb.org/3/discover/movie?api_key=${this.apiService.api_key}&language=en-US&sort_by=popularity.desc&include_adult=true&region=${this.regionQuery}`;
  searchURL = `https://api.themoviedb.org/3/search/movie?api_key=${this.apiService.api_key}&language=en-US&include_adult=true`;
  
  loaded: boolean = false;

  async ngOnInit(): Promise<void> 
  {
    this.resetFilters();

    this.initMovies();
    await this.getUpcomingMovies(this.page);
    this.collectionSize = this.movies.total_results;
    this.pageSize = Math.ceil(this.movies.total_results/this.movies.total_pages);
    this.loaded = true;
    // let input_group = document.getElementsByClassName('input-group');
    // for (let i = 0; i < input_group.length; i++) {
    //     input_group[i].children[0].addEventListener('focus', function (){
    //         input_group[i].classList.add('input-group-focus');
    //     });
    //     input_group[i].children[0].addEventListener('blur', function (){
    //         input_group[i].classList.remove('input-group-focus');
    //     });
    // }
  }
  initMovies()
  {
    this.movies = {
      total_results: 0,
      page: 1,
      results: [],
      dates: {},
      total_pages: 1
    }
  }
  async getUpcomingMovies(page: number)
  {
    this.loaded = false;
    this.header = 'Danh sách các phim sắp chiếu';
    let url = this.upcomingURL + `&page=${page}`;
    this.movies = await this.http.get<any>(url).toPromise();
    
    this.collectionSize = this.movies.total_results;
    this.pageSize = Math.ceil(this.movies.total_results/this.movies.total_pages);
    this.loaded = true;
  }
  async getPageFromService(event: any) 
  {
    if (this.fetchMode == 'upcoming') await this.getUpcomingMovies(event);
    else if (this.fetchMode == 'filter') await this.findMoviesWithRange(event);
    else await this.searchMovies(event);
    this.loaded = true;
  }
  convertToDate(ngbDate: any): Date
  {
    return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
  }
  startDateChange(event: any)
  {
    if (this.endDate && event && typeof(event) != 'string')
    {
      let sDate: Date = this.convertToDate(event);
      let eDate: Date = this.convertToDate(this.endDate);

      if (sDate.getTime() > eDate.getTime()) 
      {
        this.invalidStart = true;
        this.disable = true;
      }
      else 
      {
        this.invalidStart = false;
        this.invalidEnd = false;
        this.disable = false;
      }
    }
    else this.disable = true;
  }
  endDateChange(event: any)
  {
    if (event && this.startDate && typeof(event) != 'string')
    {
      let sDate: Date = this.convertToDate(this.startDate);
      let eDate: Date = this.convertToDate(event);

      if (sDate.getTime() > eDate.getTime())
      {
        this.invalidEnd = true;
        this.disable = true;
      }
      else {
        this.invalidStart = false;
        this.invalidEnd = false;
        this.disable = false;
      }
    }
    else this.disable = true;
  }
  async resetFilters()
  {
    this.invalidStart = false;
    this.invalidEnd = false;
    this.startDate = null;
    this.endDate = null;
    this.disable = true;
    this.fetchMode = 'upcoming';

    await this.getUpcomingMovies(1);
  }
  async findMoviesWithRange(page: number) 
  {
    this.loaded = false;
    this.header = `Danh sách các phim ra mắt từ ${this.startDate.day}/${this.startDate.month - 1}/${this.startDate.year} - ${this.endDate.day}/${this.endDate.month - 1}/${this.endDate.year}`;

    let sDate: string = this.datePipe.transform(this.convertToDate(this.startDate), "yyyy-MM-dd");
    let eDate: string = this.datePipe.transform(this.convertToDate(this.endDate), "yyyy-MM-dd");

    let url = this.filterURL + `&page=${page}&primary_release_date.gte=${sDate}&primary_release_date.lte=${eDate}`;
    this.movies = await this.http.get<any>(url).toPromise();
    
    this.collectionSize = this.movies.total_results;
    this.pageSize = Math.ceil(this.movies.total_results/this.movies.total_pages);
    this.loaded = true;
  }
  async searchMovies(page: number) 
  {
    this.loaded = false;
    this.header = `Kết quả tìm kiếm được của "${this.search}"`;
    let url = this.searchURL + `&page=${page}&query=${this.search}`;
    this.movies = await this.http.get<any>(url).toPromise();
    
    this.collectionSize = this.movies.total_results;
    this.pageSize = Math.ceil(this.movies.total_results/this.movies.total_pages);
    this.loaded = true;
  }
  getMetaData(language: string, releaseDate: string): string
  {
    let year = '';
    if (releaseDate != undefined) year = releaseDate.split('-')[0];
    if (year != '') year = ` - ${year}`;
    if (language == 'en') return 'Mỹ' + year;
    if (language == 'vi') return 'Việt Nam' + year;
    if (language == 'ko') return 'Hàn Quốc' + year;
    if (language == 'zh') return 'Trung Quốc' + year;
    else return 'Các nước khác' + year;
  }
  async onSearchChange()
  {
    if (this.search == '' || !this.search)
    {
      this.page = 1;
      this.fetchMode = 'upcoming';
      await this.getUpcomingMovies(this.page);
    }
  }
  initMovie(movie: any): any
  {
    let m: any = {
      id: movie.id,
      originalTitle: movie.original_title,
      title: '',
      plot: movie.overview,
      directors: '',
      producers: '',
      releaseDate: movie.release_date,
      runtime: 0,
      ageRating: '',
      poster: movie.poster_path == null? '': "https://image.tmdb.org/t/p/original" + movie.poster_path,
      backdrop: movie.backdrop_path == null? '': "https://image.tmdb.org/t/p/original" + movie.backdrop_path,
      trailer: '',
      languageId: 0,
      movieStatusId: 0,
      genres: [],
      casts: [],
      accountId: this.auth.currentAccountValue.id,
      createdDate: new Date()
    }
    return m;
  }
  open(movie: any)
  {
    const modalRef = this.modalService.open(MovieModalComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.name = 'Thêm phim';
    modalRef.componentInstance.movie = this.initMovie(movie);

    modalRef.result.then((result: string) => {
      if (result.includes('Failed')) {
        this.toastr.toastError('Phim đã được thêm rồi!');
      }
      else if (result.includes('Success'))
      {
        this.toastr.toastSuccess('Thêm phim thành công!');
      }
    }, (reason: any) => {})

  }
}
