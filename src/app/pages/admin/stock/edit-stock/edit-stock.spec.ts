import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStock } from './edit-stock';

describe('EditStock', () => {
  let component: EditStock;
  let fixture: ComponentFixture<EditStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
