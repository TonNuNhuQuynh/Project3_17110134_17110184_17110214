import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMoviesComponent } from './manage-movies.component';

describe('ManageMoviesComponent', () => {
  let component: ManageMoviesComponent;
  let fixture: ComponentFixture<ManageMoviesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageMoviesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMoviesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
