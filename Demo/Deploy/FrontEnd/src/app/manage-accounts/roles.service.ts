import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
  })
export class RolesService {
    
    public static user: string = "User";
    public static admin: string = "Admin"
    public static superAdmin: string = "Super Admin";
    
    constructor() {}

}