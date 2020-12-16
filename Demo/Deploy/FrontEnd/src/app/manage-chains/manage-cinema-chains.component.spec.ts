import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCinemaChainsComponent } from './manage-cinema-chains.component';

describe('ManageCinemaChainsComponent', () => {
  let component: ManageCinemaChainsComponent;
  let fixture: ComponentFixture<ManageCinemaChainsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCinemaChainsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCinemaChainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
