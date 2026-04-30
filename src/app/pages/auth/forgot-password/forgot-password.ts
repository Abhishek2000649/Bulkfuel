import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Spinner } from '../../../shared/spinner/spinner';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

type ForgotFormFields = 'email';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, Spinner, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  forgotForm!: FormGroup;
  isLoading: boolean = false;

  formErrors: Record<ForgotFormFields, string> = {
    email: '',
  };

  validationMessages: Record<ForgotFormFields, any> = {

    email: {
      required: 'Enter email',
      email: 'Enter a valid email address',
    }

  };

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.forgotForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }


  updateFormErrors(): void {

    (Object.keys(this.formErrors) as ForgotFormFields[]).forEach((field) => {

      const control = this.forgotForm.get(field);
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

  }



  submitEmail() {

    const emailData = {
      email: this.forgotForm.value.email,
      type: 'forgot',
    };

    this.isLoading = true;

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.auth.forgotPassword(this.forgotForm.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (res: any) => {

          if (res.status) {

            this.auth.setData(emailData);

            Swal.fire({
              title: res.message || "Reset link sent",
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#d4af37',
              background: 'linear-gradient(135deg, #3b0000, #1a0000)',
              color: '#ffffff',
              iconColor: '#22c55e',
            });

            this.router.navigate(['/verify-otp']); // OR reset-password
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