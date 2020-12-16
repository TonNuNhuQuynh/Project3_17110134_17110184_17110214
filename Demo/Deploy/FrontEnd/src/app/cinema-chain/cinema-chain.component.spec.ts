import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CinemaChainComponent } from './cinema-chain.component';

describe('CinemaChainComponent', () => {
  let component: CinemaChainComponent;
  let fixture: ComponentFixture<CinemaChainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CinemaChainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CinemaChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
