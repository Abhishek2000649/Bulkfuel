import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeProduct } from './home-product';

describe('HomeProduct', () => {
  let component: HomeProduct;
  let fixture: ComponentFixture<HomeProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeProduct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
