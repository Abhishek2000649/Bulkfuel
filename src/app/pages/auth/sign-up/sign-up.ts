import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Spinner } from '../../../shared/spinner/spinner';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

type SignUpFormFields = 'name' | 'email' | 'terms';

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

  formErrors: Record<SignUpFormFields, string> = {
    name: '',
    email: '',
    terms: '',
  };

  validationMessages: Record<SignUpFormFields, any> = {

    name: {
      required: 'Enter your name',
    },

    email: {
      required: 'Enter email',
      email: 'Enter a valid email address',
    },
    terms: {
      required: 'You must accept Terms & Policy'
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
      terms: [false, Validators.requiredTrue]
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



  }



  register() {
    const userData = {
      email: this.registerForm.value.email,
      name: this.registerForm.value.name,
      type: 'register'
    };

    this.isLoading = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading = false;
      this.cdr.detectChanges();
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


            this.auth.setData(userData);

            Swal.fire({
              title: res.message || "OTP Send",
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#d4af37',
              background: 'linear-gradient(135deg, #3b0000, #1a0000)',
              color: '#ffffff',
              iconColor: '#22c55e',
            });

            this.router.navigate(['/verify-otp']);
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