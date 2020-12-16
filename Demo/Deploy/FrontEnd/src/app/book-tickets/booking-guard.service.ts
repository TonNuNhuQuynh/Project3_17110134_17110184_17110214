import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { StorageService } from "app/storage.service";


@Injectable()
export class BookingGuardService implements CanActivate 
{
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean  
    {
        if (sessionStorage.getItem(StorageService.bookingInfo) == null) return false;
        return true;
    }

}