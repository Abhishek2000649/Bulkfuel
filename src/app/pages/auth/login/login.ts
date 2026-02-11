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
        switchMap((res) => {
          localStorage.setItem('token', res.token);
          return this.auth.me();
        }),
         finalize(() => {
        this.isLoading = false;
        console.log("finalize"+ this.isLoading);
        this.cdr.detectChanges();
      }),
      )
      .subscribe({
        next: (res) => {
          console.log("200"+ this.isLoading);
          const user = res?.user;

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
           this.loginForm.reset();
          console.log("401"+ this.isLoading);
          console.log('Status code:', err.status);
          console.log('Message:', err.error?.message);
          console.log(err);
          
        },
      });
  }
}
