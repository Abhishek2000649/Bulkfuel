import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserManagement } from './edit-user-management';

describe('EditUserManagement', () => {
  let component: EditUserManagement;
  let fixture: ComponentFixture<EditUserManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
