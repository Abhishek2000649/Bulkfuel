import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Spinner } from '../../../shared/spinner/spinner';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

type SignUpFormFields = 'name' | 'email' | 'password' | 'confirmPassword';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, Spinner, CommonModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {

  registerForm!: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  formErrors: Record<SignUpFormFields, string> = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  validationMessages: Record<SignUpFormFields, any> = {

    name: {
      required: 'Enter your name',
    },

    email: {
      required: 'Enter email',
      email: 'Enter a valid email address',
    },

    password: {
      required: 'Enter password',
      minlength: 'Password must be at least 6 characters',
    },

    confirmPassword: {
      required: 'Confirm your password',
      mismatch: 'Passwords do not match'
    }

  };

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });

    this.registerForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }


  updateFormErrors(): void {

    (Object.keys(this.formErrors) as SignUpFormFields[]).forEach((field) => {

      const control = this.registerForm.get(field);
      this.formErrors[field] = '';

      if (control && control.invalid && (control.dirty || control.touched)) {

        const message = this.validationMessages[field];

        if (control.errors) {
          for (const errorKey of Object.keys(control.errors)) {
            this.formErrors[field] = message[errorKey];
            break;
          }
        }

      }

    });


    // PASSWORD MATCH VALIDATION

    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      this.formErrors.confirmPassword = this.validationMessages.confirmPassword.mismatch;
    }

  }



  register() {

    this.isLoading = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading = false;
      return;
    }

    // PASSWORD MATCH CHECK

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {

      this.formErrors.confirmPassword = 'Passwords do not match';
      this.isLoading = false;
      return;

    }

    this.auth.register(this.registerForm.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (res: any) => {

          if (res.status) {

            Swal.fire({
              title: res.message || "Register successfully",
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#d4af37',
              background: 'linear-gradient(135deg, #3b0000, #1a0000)',
              color: '#ffffff',
              iconColor: '#22c55e',
            });

            this.router.navigate(['/login']);
          }

        },

        error: (err) => {

          Swal.fire({
            title: err.error.message || "Something went wrong",
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444',
          });

          console.error(err);

        },

      });

  }

}