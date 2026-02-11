import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserManagement } from '../../../../core/services/admin/userManagement/user-management';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
import { required } from '@angular/forms/signals';
type UserManagementFormFields = 'name' | 'email' | 'role' | 'password';
@Component({
  selector: 'app-edit-user-management',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Spinner],
  templateUrl: './edit-user-management.html',
  styleUrl: './edit-user-management.css',
})
export class EditUserManagement {

    userForm!: FormGroup;
  userId!: number;
  errors: string[] = [];
  isLoading:boolean=false;
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
        required: 'select any role',
      },
      password: {
        required: 'Enter password',
        minlength: 'Password must be at least 6 characters',
      },
    };
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: UserManagement,
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

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadUser();
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
  loadUser() {
    this.isLoading=true;
    this.adminService.getUserById(this.userId).subscribe({
      next: (res) => {
        this.userForm.patchValue({
          name: res.name,
          email: res.email,
          role: res.role,
        });
        this.isLoading=false;
      },
      error: (err) => {
        this.isLoading=false;
        console.error(err);
      },
    });
  }

  onSubmit() {
    this.isLoading=true;
    if (this.userForm.invalid) {
        this.userForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading=false;
      return;
    }

    this.errors = [];

    this.adminService.updateUser(this.userId, this.userForm.value).pipe(
          finalize(()=>{
            this.isLoading= false;
            this.cdr.detectChanges();
          })
        )
      .subscribe({
        next: () => {
          this.isLoading=false;
          alert('User updated successfully');
          this.router.navigate(['/admin/userManagement']);
        },
        error: (err) => {
          this.isLoading=false;
          console.log(err);
          
        },
      });
  }

}
