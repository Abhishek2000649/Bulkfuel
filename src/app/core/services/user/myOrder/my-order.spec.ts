import { TestBed } from '@angular/core/testing';

import { MyOrder } from './my-order';

describe('MyOrder', () => {
  let service: MyOrder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyOrder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
