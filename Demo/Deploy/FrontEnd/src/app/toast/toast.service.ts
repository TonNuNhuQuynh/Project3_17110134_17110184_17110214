import { Inject, Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: 'root'})
export class ToastService 
{
    constructor (@Inject(ToastrService) private toastr: ToastrService) {}

    public toastSuccess(msg: string)
    {
        this.toastr.success(msg, '', {
        closeButton: true,
        timeOut: 3000
        });
    }
    public toastError(msg: string)
    {
        this.toastr.error(msg, '', {
        closeButton: true,
        timeOut: 3000
        });
    }

    public toastInfo (msg: string)
    {
        this.toastr.info(msg, '', {
            closeButton: true,
            timeOut: 5000
        });
    }
}