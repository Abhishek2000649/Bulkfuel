import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Spinner } from '../../../shared/spinner/spinner';
import { CommonModule } from '@angular/common';
import { required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
type SignUpFormFields = 'name' | 'email' | 'password';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, Spinner, CommonModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  registerForm!: FormGroup;
  isLoading:boolean = false;
  formErrors: Record<SignUpFormFields, string> = {
    name: '',
    email: '',
    password: '',
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
  };
  constructor(private fb: FormBuilder, private auth: Auth, private router: Router, private cdr:ChangeDetectorRef) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }


  updateFormErrors(): void {
    (Object.keys(this.formErrors) as SignUpFormFields[]).forEach((field)=>{
      const control = this.registerForm.get(field);
      this.formErrors[field]= '';

      if(control && control.invalid && (control.dirty || control.touched))
      {
        const message = this.validationMessages[field];

        if(control.errors)
        {
          for(const errorkey of Object.keys(control.errors)) {
            this.formErrors[field] =  message[errorkey];
            break;
          }
        }
      }
    });


  }

  register() {
    this.isLoading = true;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading = false;
      return;
    }

    this.auth.register(this.registerForm.value).pipe(
      finalize(()=>{
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        if (res.status) {
          
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        
        console.error(err);
      },
    });
  }
}
