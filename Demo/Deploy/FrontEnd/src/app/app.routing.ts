import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { ComponentsComponent } from './components/components.component';

//New import
import { AddMovieComponent } from './add-movie/add-movie.component';
import { ManageMoviesComponent } from './manage-movies/manage-movies.component';
import { ManageAccountsComponent } from './manage-accounts/manage-accounts.component';
import { ManageCinemaChainsComponent } from './manage-chains/manage-cinema-chains.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { RoleGuardService as RoleGuard } from './authentication/role-guard.service';
import { RolesService as Roles} from './manage-accounts/roles.service';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { ReviewListComponent } from './movie-details/review-list/review-list.component';
import { ShowtimesComponent } from './movie-details/showtimes/showtimes.component';
import { CinemaDetailsComponent } from './cinema-details/cinema-details.component';
import { BookTicketsComponent } from './book-tickets/book-tickets.component';
import { SeatsComponent } from './book-tickets/seats/seats.component';
import { CheckoutComponent } from './book-tickets/checkout/checkout.component';
import { TicketDetailsComponent } from './book-tickets/ticket-details/ticket-details.component';
import { BookingGuardService as BookingGuard } from './book-tickets/booking-guard.service';
import { SearchComponent } from './search/search.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SendEmailComponent } from './reset-password/send-email/send-email.component';
import { CinemaChainComponent } from './cinema-chain/cinema-chain.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { StatisticsComponent } from './statistics/statistics.component';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: ComponentsComponent },
    { path: 'dashboard', redirectTo: 'dashboard/manage-movies'},
    
    { 
      path: 'profile', 
      component: ProfileComponent,
      canActivate: [RoleGuard], 
      data: { expectedRoles: [Roles.admin, Roles.superAdmin, Roles.user]}
    },

    { 
      path: 'add-movie',
      component: AddMovieComponent,
      canActivate: [RoleGuard], 
      data: { expectedRoles: [Roles.admin, Roles.superAdmin]}
    },

    { 
      path: 'manage-movies', 
      component: ManageMoviesComponent,
      canActivate: [RoleGuard], 
      data: { expectedRoles: [Roles.admin, Roles.superAdmin] } 
    },

    { 
      path: 'manage-accounts',
      component: ManageAccountsComponent,
      canActivate: [RoleGuard], 
      data: { expectedRoles: [Roles.admin, Roles.superAdmin] }
    },

    { 
      path: 'manage-chains',
      component: ManageCinemaChainsComponent,
      canActivate: [RoleGuard], 
      data: { expectedRoles: [Roles.superAdmin] }
    },
    
    { path: 'register', component: RegisterComponent},
    { path: 'verify', component: VerifyEmailComponent},
    { path: 'movie/now', component: MovieListComponent, data: {status: 1}},
    { path: 'movie/upcomings', component: MovieListComponent, data: {status: 2}},

    { path: 'movie-details', redirectTo: 'movie-details/reviews'},
    { path: 'movie-details', 
      component: MovieDetailsComponent, 
      children: [ 
        { path: 'reviews', component: ReviewListComponent }, { path: 'showtimes', component: ShowtimesComponent } 
      ] 
    },
    { path: 'cinema', component: CinemaDetailsComponent},

    { path: 'booking', redirectTo: 'booking/seats'},
    { path: 'booking', 
      canActivate: [BookingGuard],
      component: BookTicketsComponent, 
      children: 
      [ 
        { path: 'seats', component: SeatsComponent }, { path: 'checkout', component: CheckoutComponent }, { path: 'done', component: TicketDetailsComponent } 
      ] 
    },

    { path: 'search', component: SearchComponent },
    { path: 'forgot-password', component: SendEmailComponent },
    { path: 'reset', component: ResetPasswordComponent },
    { path: 'chain', component: CinemaChainComponent },
    { path: 'not-found', component: NotFoundComponent },

    { 
      path: 'watchlist', 
      component: WatchlistComponent,
      canActivate: [RoleGuard], 
      data: { expectedRoles: [Roles.admin, Roles.superAdmin, Roles.user]}
    },
    { 
      path: 'statistics', 
      component: StatisticsComponent,
      canActivate: [RoleGuard], 
      data: { expectedRoles: [Roles.admin, Roles.superAdmin, Roles.user]}
    },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes,{
      useHash: true
    })
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
