import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, switchMap } from 'rxjs';

import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Spinner } from '../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

type LoginFormFields = 'email' | 'password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, Spinner],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;
  isLoading = false;
  formErrors: Record<LoginFormFields, string> = {
    email: '',
    password: '',
  };
  validationMessages: Record<LoginFormFields, any> = {
    email: {
      required: 'Enter email',
      email: 'Enter a valid email address',
    },
    password: {
      required: 'Enter password',
      minlength: 'Password must be at least 6 characters',
    },
  };

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    
    this.loginForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

  
  updateFormErrors(): void {
    (Object.keys(this.formErrors) as LoginFormFields[]).forEach((field) => {
      const control = this.loginForm.get(field);
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

  login(): void {
    this.isLoading = true;
    console.log("login start"+ this.isLoading);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading = false;
      return;
    }

    this.auth
  .login(this.loginForm.value)
  .pipe(
    switchMap((res: any) => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return this.auth.me();
    }),
    finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })
  )
  .subscribe({
    next: (res) => {
      const user = res?.user;
        Swal.fire({
          title: res.message || "Login successfull",
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',   
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e', });

      switch (user.role) {
        case 'ADMIN':
          this.router.navigate(['/admin']);
          break;
        case 'delivery_agent':
          this.router.navigate(['/delivery/available']);
          break;
        case 'USER':
          this.router.navigate(['/user']);
          break;
        default:
          this.router.navigate(['/login']);
      }
    },
    error: (err) => {
      Swal.fire({
      title: err.error?.message || 'Something went wrong',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d4af37',
      background: 'linear-gradient(135deg, #3b0000, #1a0000)',
      color: '#ffffff',
      iconColor: '#ef4444'
    });
      this.loginForm.reset();
      console.log(err);
    },
  });

  }
}
