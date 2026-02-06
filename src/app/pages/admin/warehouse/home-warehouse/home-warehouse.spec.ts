import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeWarehouse } from './home-warehouse';

describe('HomeWarehouse', () => {
  let component: HomeWarehouse;
  let fixture: ComponentFixture<HomeWarehouse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeWarehouse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeWarehouse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
