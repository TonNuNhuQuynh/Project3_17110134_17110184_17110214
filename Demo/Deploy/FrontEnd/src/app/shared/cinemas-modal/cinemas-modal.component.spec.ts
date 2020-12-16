import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CinemasModalComponent } from './cinemas-modal.component';

describe('CinemasModalComponent', () => {
  let component: CinemasModalComponent;
  let fixture: ComponentFixture<CinemasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CinemasModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CinemasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
