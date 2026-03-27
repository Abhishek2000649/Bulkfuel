import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryContact } from './delivery-contact';

describe('DeliveryContact', () => {
  let component: DeliveryContact;
  let fixture: ComponentFixture<DeliveryContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryContact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryContact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
