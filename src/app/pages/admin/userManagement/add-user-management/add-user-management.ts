import { ChangeDetectorRef, Component } from '@angular/core';
import { UserManagement } from '../../../../core/services/admin/userManagement/user-management';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../../shared/spinner/spinner';
import { pattern, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
type UserManagementFormFields = 'name' | 'email' | 'role' | 'password';
@Component({
  selector: 'app-add-user-management',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, Spinner],
  templateUrl: './add-user-management.html',
  styleUrl: './add-user-management.css',
})
export class AddUserManagement {

    userForm: FormGroup;
  errors: string[] = [];
  isLoading:boolean= false;
   formErrors: Record<UserManagementFormFields, string> = {
    name: '',
    email: '',
    role: '',
    password: '',
  };
  validationMessages: Record<UserManagementFormFields, any> = {
    name: {
      required: 'Enter name',
      pattern: 'Enter valid name',
    },
    email: {
      required: 'Enter email',
      email: 'Enter a valid email address',
    },
    role:{
      required: 'Select role',
    },
    password: {
      required: 'Enter password',
      minlength: 'Password must be at least 6 characters',
    },
  };

  constructor(
    private fb: FormBuilder,
    private adminService: UserManagement,
    private router: Router,
    private cdr:ChangeDetectorRef,
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required,      Validators.pattern(/^[A-Za-z\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
     this.userForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }
  updateFormErrors(): void {
    (Object.keys(this.formErrors) as UserManagementFormFields[]).forEach((field) => {
      const control = this.userForm.get(field);
      this.formErrors[field] = '';

      if (control && control.invalid && (control.dirty || control.touched)) {
        const messages = this.validationMessages[field];

        if (control.errors) {
          for (const errorKey of Object.keys(control.errors)) {
            this.formErrors[field] = messages[errorKey];
            break; 
          }
        }
      }
    });
  }
  onSubmit() {

  this.isLoading = true;

  if (this.userForm.invalid) {
    this.userForm.markAllAsTouched();
    this.updateFormErrors();
    this.isLoading = false;
    return;
  }

  this.errors = [];

  this.adminService.addUser(this.userForm.value)
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({

      // ✅ SUCCESS
      next: (res: any) => {

        Swal.fire({
          title: res?.message || 'User added successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e'
        }).then(() => {
          this.router.navigate(['/admin/userManagement']);
        });

      },

      // ❌ ERROR
      error: (err: any) => {

        Swal.fire({
          title: err.error?.message || 'Failed to add user',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        });

        console.log(err);
      }

    });

}


}
