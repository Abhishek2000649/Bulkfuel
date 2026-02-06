import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settlement } from './settlement';

describe('Settlement', () => {
  let component: Settlement;
  let fixture: ComponentFixture<Settlement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settlement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Settlement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
