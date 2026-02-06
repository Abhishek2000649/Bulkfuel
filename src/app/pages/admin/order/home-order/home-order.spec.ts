import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeOrder } from './home-order';

describe('HomeOrder', () => {
  let component: HomeOrder;
  let fixture: ComponentFixture<HomeOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
