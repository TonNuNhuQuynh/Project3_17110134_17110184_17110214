import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Account } from 'app/manage-accounts/model'
import { ApiService } from 'app/api.service';
import { RolesService } from 'app/manage-accounts/roles.service';
import { ActivityStorage, ReviewLike } from './model';
import { StorageService } from 'app/storage.service';


@Injectable({
    providedIn: 'root',
})

export class AuthenticationService 
{
   private currentAccountSubject: BehaviorSubject<Account>;
   public remember: boolean = false;
   private currentAccount: Observable<Account>;
   public activityStorage: ActivityStorage;

   private account_storage: string = StorageService.accountStorage;
   private activity_storage: string = StorageService.activityStorage;

   constructor(private http: HttpClient, private apiService: ApiService, private rolesService: RolesService) 
   {
       console.log(1)
       let account = localStorage.getItem(this.account_storage);
       if (account == null) 
       {
           account = sessionStorage.getItem(this.account_storage);
           this.remember = false;
       }
       else this.remember = true;
       
       this.currentAccountSubject = new BehaviorSubject<Account>(
           account == null? null: JSON.parse(account)
       );
       this.currentAccount = this.currentAccountSubject.asObservable();

       let activities = localStorage.getItem(this.activity_storage)? localStorage.getItem(this.activity_storage): sessionStorage.getItem(this.activity_storage);
       this.activityStorage = activities? JSON.parse(activities): {rateIds: [], movieLikeIds: [], reviewLikes: []};
   }
  
   public get currentAccountValue(): Account 
   {
    //    let a: Account = {
    //        id: 1,
    //        username: 'tnnhuquynh',
    //        email: null,
    //        password: '',
    //        phone: null,
    //        roleName: this.rolesService.superAdmin,
    //        user: null,
    //        isActive: true
    //    }
    //    return a;
        return this.currentAccountSubject.value;
   }
   public get currentAccountAsSubject(): BehaviorSubject<Account>
   {
       return this.currentAccountSubject;
   }
   public saveAccount(account: Account, remember: boolean, activities: ActivityStorage)
   {
       this.remember = remember;
       this.activityStorage = activities;

       this.setAccount(account);
       this.setActivityStorage();
       
       this.currentAccountSubject.next(account);
   }
   public logout()
   {
       if (this.remember)
       {
           localStorage.removeItem(this.account_storage);
           localStorage.removeItem(this.activity_storage);
           this.remember = false;
       }
       else 
       {
           sessionStorage.removeItem(this.account_storage); 
           sessionStorage.removeItem(this.activity_storage);
       }
       this.currentAccountSubject.next(null);
   }
   private setAccount(account: Account)
   {
        if (this.remember) localStorage.setItem(this.account_storage, JSON.stringify(account));
        else  sessionStorage.setItem(this.account_storage, JSON.stringify(account));
   }
   private setActivityStorage()
   {
       if (this.remember) localStorage.setItem(this.activity_storage, JSON.stringify(this.activityStorage));
       else sessionStorage.setItem(this.activity_storage, JSON.stringify(this.activityStorage));
   }
   public updateLike(movieId: number, isAdded: boolean)
   {
       if (isAdded) this.activityStorage.movieLikeIds.push(movieId);
       else this.activityStorage.movieLikeIds = this.activityStorage.movieLikeIds.filter(m => m != movieId);
       this.setActivityStorage();      
   }

   public updateRate(movieId: number, isAdded: boolean)
   {
       if (isAdded) this.activityStorage.rateIds.push(movieId);
       else this.activityStorage.rateIds = this.activityStorage.rateIds.filter(m => m != movieId);
       this.setActivityStorage();
   }
   public updateReviewLike (reviewLike: ReviewLike)
   {
    let reviewLikeInStorage = this.activityStorage.reviewLikes.find(r => r.reviewId == reviewLike.reviewId);
    if (reviewLikeInStorage != null) 
    {
        if (!reviewLike.disLiked && !reviewLike.liked) this.activityStorage.reviewLikes = this.activityStorage.reviewLikes.filter(r => r.reviewId != reviewLike.reviewId)
        else reviewLikeInStorage = reviewLike;
    }
    else this.activityStorage.reviewLikes.push(reviewLike)
    this.setActivityStorage();
   }
   public isAuthenticated(): boolean 
   {
       if (this.currentAccountSubject.value) return true;
       return false; 
   }
   public updateProfilePic(base64: string)
   {
       let account = this.currentAccountSubject.value;
       account.user.image = base64;
       this.setAccount(account);
       this.currentAccountSubject.next(account);
   }
//    async register(email: string, password: string) 
//    {
//        this.afAuth.createUserWithEmailAndPassword(email, password).then((res) => {
//            console.log(firebase.auth().currentUser);
//            this.afAuth.currentUser.then(u => u.sendEmailVerification());
//        })
//    }
  
//    public login = (username: string, password: string) => {
//             console.log(username);
//             console.log(password);
//             const loginUrl = `${this.urlAPI}/api/Accounts/Signin`;
//             console.log(loginUrl);
//             return this.http
//             .post<any>(loginUrl, {
//                 username,
//                 password
//         })
//         .pipe(
//         map((account) => {
//         // console.log(user);
//             if (account != null){
//                 const newAccount = {} as Account;
//                 newAccount.id = account.id;
//                 newAccount.username = account.username;
//                 newAccount.password = account.password;
//                 newAccount.role = account.role;
//                 newAccount.isactive = account.isActive;
//                 localStorage.setItem('currentAccount', JSON.stringify(newAccount));
//                 this.currentAccountSubject.next(newAccount);
//                 return account;
//             } 
//             else {
//                 return null;
//             }
//         })
//         );
//    }
  
//    public logout = () => {
//     localStorage.removeItem('username');
//     localStorage.removeItem('password');
//     localStorage.removeItem('currentAccount');
//     this.currentAccountSubject.next(null);
//    }
}