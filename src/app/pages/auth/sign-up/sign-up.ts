import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Spinner } from '../../../shared/spinner/spinner';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterModule, Spinner],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  registerForm!: FormGroup;
  isLoading:boolean = false;
  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  register() {
    this.isLoading = true;
    if (this.registerForm.invalid) {
      this.isLoading = false;
      return;
    }

    this.auth.register(this.registerForm.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.isLoading = false;
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      },
    });
  }
}
