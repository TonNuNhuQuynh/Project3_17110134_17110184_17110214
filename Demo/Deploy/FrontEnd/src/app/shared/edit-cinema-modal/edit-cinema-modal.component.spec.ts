import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCinemaModalComponent } from './edit-cinema-modal.component';

describe('EditCinemaModalComponent', () => {
  let component: EditCinemaModalComponent;
  let fixture: ComponentFixture<EditCinemaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCinemaModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCinemaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
