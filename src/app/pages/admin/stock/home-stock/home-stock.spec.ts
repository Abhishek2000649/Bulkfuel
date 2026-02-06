import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeStock } from './home-stock';

describe('HomeStock', () => {
  let component: HomeStock;
  let fixture: ComponentFixture<HomeStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeStock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
