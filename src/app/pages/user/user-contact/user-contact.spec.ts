import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserContact } from './user-contact';

describe('UserContact', () => {
  let component: UserContact;
  let fixture: ComponentFixture<UserContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserContact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserContact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
