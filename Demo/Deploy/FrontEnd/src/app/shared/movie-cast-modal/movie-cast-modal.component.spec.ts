import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieCastModalComponent } from './movie-cast-modal.component';

describe('MovieCastModalComponent', () => {
  let component: MovieCastModalComponent;
  let fixture: ComponentFixture<MovieCastModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovieCastModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieCastModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
