import { HttpClient } from '@angular/common/http';
import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/api.service';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { ListReview, Review } from './model';
import { ReviewLike } from 'app/authentication/model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginModalComponent } from 'app/shared/login-modal/login-modal.component';


@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit{

  lstReview: ListReview;
  movieId: number = 0;
  movieAvgRating: number = 0;
  allowedDate: Date = null;
  isLoaded: boolean = false;
  isLoadedMore: boolean = false;
  isRevealed: boolean = true;

  constructor(private modalService: NgbModal, private auth: AuthenticationService, private http: HttpClient, private apiService: ApiService, private route: ActivatedRoute) 
  { }
  
  async ngOnInit(): Promise<void> 
  {
    this.route.queryParams.subscribe(params => {
      this.movieId = Number(params["movieId"]) || 0;
    });
    if (this.checkTime())
    {
      this.isLoaded = false;
      this.lstReview = {reviews: [], total: 0, percent: 0, likes: 0, title: '', releaseDate: null}
      await this.getReviews();
      this.calculateAllowedDate();   
      this.isLoaded = true; 
    }
  }
  async getReviews()
  {
    let url = this.apiService.backendHost + `/api/Reviews/${this.movieId}`;
    try 
    {
      this.lstReview = await this.http.get<ListReview>(url).toPromise();
    }
    catch(e) { console.log(e) };
  }
  
  calculateAllowedDate()
  {
    var release = new Date(this.lstReview.releaseDate);
    release.setHours(0); 
    release.setMinutes(0); 
    release.setSeconds(0);
    this.allowedDate = new Date(release.setDate(release.getDate() - 2));
  }
  checkTime(): boolean
  {
    if (this.allowedDate > new Date()) return false;
    return true;
  }
  async loadMore()
  {
    this.isLoadedMore = true;
    let url = this.apiService.backendHost + `/api/Reviews/${this.movieId}/${this.lstReview.reviews.length}`;
    try 
    {
      let result = await this.http.get<Review[]>(url).toPromise();
      result.forEach(element => {
        this.lstReview.reviews.push(element);
      });
      this.isLoadedMore = false;
    }
    catch(e) { console.log(e) };
  }
  openLoginModal()
  {
    const modalRef = this.modalService.open(LoginModalComponent, {windowClass: "login"});
    modalRef.result.then(async (result: any) => 
      {
        if (result == 'Success') window.location.reload();
      }, (reason: any) => {})
  }
  isLiked(id: number)
  {
    return (this.auth.activityStorage.reviewLikes.find(e => e.reviewId == id && e.liked) != null);
  }
  isDisliked(id: number)
  {
    return (this.auth.activityStorage.reviewLikes.find(e => e.reviewId == id && e.disLiked) != null);
  }
  async likeReview(event: any, review: Review)
  {
    if (this.auth.currentAccountValue == null) this.openLoginModal();
    else 
    {
      let reviewLike = this.auth.activityStorage.reviewLikes.find(r => r.reviewId == review.id);
      if (event.currentTarget.classList.contains('text-success')) reviewLike.liked = false;
      else 
      {
        if (!reviewLike) reviewLike = {accountId: this.auth.currentAccountValue.id, reviewId: review.id, liked: true, disLiked: false};
        else 
        {
          if (reviewLike.disLiked) review.dislikeCounts --;
          reviewLike.liked = true;
          reviewLike.disLiked = false;
        }
      }
    
      let url = this.apiService.backendHost + '/api/ReviewLikes';
      try 
      {
        let result = await this.http.post<ReviewLike>(url, reviewLike).toPromise();
        if (result) 
        {
          if (reviewLike.liked) review.likeCounts ++;
          else review.likeCounts --;
          this.auth.updateReviewLike(result);
        }
      }
      catch (e) { console.log(e) }
    }
  }

  async dislikeReview(event: any, review: Review)
  {
    if (this.auth.currentAccountValue == null) this.openLoginModal();
    else 
    {
      let reviewLike = this.auth.activityStorage.reviewLikes.find(r => r.reviewId == review.id);
      if (event.currentTarget.classList.contains('text-danger')) reviewLike.disLiked = false;
      else 
      {
        if (!reviewLike) reviewLike = {accountId: this.auth.currentAccountValue.id, reviewId: review.id, liked: false, disLiked: true};
        else 
        {
          if (reviewLike.liked) review.likeCounts --;
          reviewLike.liked = false;
          reviewLike.disLiked = true;
        }  
      }
         
      let url = this.apiService.backendHost + '/api/ReviewLikes';
      try 
      {
        let result = await this.http.post<ReviewLike>(url, reviewLike).toPromise();
        if (result) 
        {
          if (reviewLike.disLiked) review.dislikeCounts ++;
          else review.dislikeCounts --;
          this.auth.updateReviewLike(result);
        }
      }
      catch (e) { console.log(e) }
    }
  }
}
