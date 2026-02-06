import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Available } from './available';

describe('Available', () => {
  let component: Available;
  let fixture: ComponentFixture<Available>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Available]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Available);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
