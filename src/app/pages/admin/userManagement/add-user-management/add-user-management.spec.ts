import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserManagement } from './add-user-management';

describe('AddUserManagement', () => {
  let component: AddUserManagement;
  let fixture: ComponentFixture<AddUserManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUserManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
