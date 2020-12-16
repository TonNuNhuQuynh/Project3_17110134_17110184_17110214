import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthenticationService } from "./authentication.service";
import { LoginModalComponent } from 'app/shared/login-modal/login-modal.component';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Injectable()
export class RoleGuardService implements CanActivate {
  constructor(public auth: AuthenticationService, public router: Router, private modalService: NgbModal) {}
  public redirectUrl: string;
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean 
  {
    const expectedRoles: string[] = route.data.expectedRoles;
    const account = this.auth.currentAccountValue;
    this.redirectUrl = state.url;
    
    if (!this.auth.isAuthenticated())
    {
      this.router.navigate(['home']);
      this.openLoginModal();
      return false;
    } 
    if (expectedRoles.indexOf(account.roleName) == -1) 
    {
      this.router.navigate(['home']);
      return false;
    }
    return true;
  }

  openLoginModal()
  {
    const modalRef = this.modalService.open(LoginModalComponent, {windowClass: "login"});
    modalRef.result.then(async (result: any) => 
      {
        if (result == 'Success') this.router.navigateByUrl(this.redirectUrl)
      }, (reason: any) => {})
  }
}