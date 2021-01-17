import { Component, OnInit, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginModalComponent } from 'app/shared/login-modal/login-modal.component';
import { LocationModalComponent } from '../location-modal/location-modal.component';
import { CinemasModalComponent } from '../cinemas-modal/cinemas-modal.component';
import { LocationService } from 'app/location.service';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { RolesService } from 'app/manage-accounts/roles.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Account } from 'app/manage-accounts/model';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    private toggleButton: any;
    private sidebarVisible: boolean;

    constructor(private router: Router, private auth: AuthenticationService, private locationService: LocationService, private modalService: NgbModal, public location: Location, private element : ElementRef) {
        this.sidebarVisible = false;
    }

    isAdmin: boolean = false;
    isSupAdmin: boolean = false;
    query: string = '';

    ngOnInit() {
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];

        this.auth.currentAccountAsSubject.subscribe(() => {
            this.isAdmin = this.auth.currentAccountValue == null ? false: this.auth.currentAccountValue.roleName == RolesService.admin || this.auth.currentAccountValue.roleName == RolesService.superAdmin;
            this.isSupAdmin = this.auth.currentAccountValue == null ? false: this.auth.currentAccountValue.roleName == RolesService.superAdmin;
        })
    }
    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const html = document.getElementsByTagName('html')[0];
        
        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);
        html.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const html = document.getElementsByTagName('html')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        html.classList.remove('nav-open');
    };
    sidebarToggle() {
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    };
    isHome() {
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }
        if( titlee === '/home' ) {
            return true;
        }
        else {
            return false;
        }
    }
    isDocumentation() 
    {
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }
        if( titlee === '/documentation' ) {
            return true;
        }
        else {
            return false;
        }
    }
    openLoginModal()
    {
        const modalRef = this.modalService.open(LoginModalComponent, {windowClass: "login"});

        modalRef.result.then(async (result: any) => 
        {
            if (result == 'Success') 
            {
                if (this.isAdmin) this.router.navigate(['/statistics']);
                else window.location.reload();
                
            }
        }, () => {})
    }
    openLocationModal()
    {
        const modalRef = this.modalService.open(LocationModalComponent, {windowClass: "fixed-right"});

        modalRef.result.then(async (result: any) => 
        {
            if (result == 'Success') window.location.reload();
        }, () => {})
    }
    openCinemasModal()
    {
        const modalRef = this.modalService.open(CinemasModalComponent, {windowClass: "rate"});
        modalRef.componentInstance.cityId = this.locationService.currentCity.id;
        modalRef.componentInstance.cityName = this.locationService.currentCity.name;
        modalRef.result.then(async () => 
        { 
            
        }, () => {})
    }
    search()
    {
        this.router.navigate(['/search'], {queryParams: {name: this.query}});
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
        if (base64 == null || base64 == '') return "./assets/img/user-default.png";
        return `data:image/${this.getImageMime(base64)};base64,${base64}`; 
    }
    logout()
    {
        this.auth.logout();
        window.location.reload();
    }
}
