import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-trailer-modal',
  templateUrl: './trailer-modal.component.html',
  styleUrls: ['./trailer-modal.component.css']
})
export class TrailerModalComponent implements OnInit {

  constructor(private _sanitizer: DomSanitizer) { }

  safeURL: SafeResourceUrl;
  @Input() url: string;
  ngOnInit(): void 
  {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

}
