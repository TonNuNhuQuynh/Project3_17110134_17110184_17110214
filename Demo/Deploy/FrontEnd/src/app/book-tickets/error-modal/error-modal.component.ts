import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.css']
})
export class ErrorModalComponent implements OnInit {

  @Input() message: string;
  @Input() redirectUrl: string;

  constructor(private activeModal: NgbActiveModal, private router: Router) { }

  ngOnInit(): void 
  {
    
  }

  redirect()
  {
    this.router.navigateByUrl(this.redirectUrl);
    this.activeModal.close('Close');
  }
}
