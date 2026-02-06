import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeUserManagement } from './home-user-management';

describe('HomeUserManagement', () => {
  let component: HomeUserManagement;
  let fixture: ComponentFixture<HomeUserManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeUserManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeUserManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
