import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStock } from './add-stock';

describe('AddStock', () => {
  let component: AddStock;
  let fixture: ComponentFixture<AddStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
