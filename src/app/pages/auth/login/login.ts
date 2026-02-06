import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule], // 👈 IMPORTANT
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    // 🔹 Form initialization
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.auth
      .login(this.loginForm.value)
      .pipe(
        
        switchMap((res) => {
          localStorage.setItem('token', res.token);
          return this.auth.me(); // returns full response
        })
      )
      .subscribe({
        next: (res) => {
          const user = res.user; // 🔥 IMPORTANT

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
          console.error(err);
        },
      });
  }
}
