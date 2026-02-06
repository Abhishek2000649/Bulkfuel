import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWarehouse } from './edit-warehouse';

describe('EditWarehouse', () => {
  let component: EditWarehouse;
  let fixture: ComponentFixture<EditWarehouse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWarehouse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditWarehouse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
