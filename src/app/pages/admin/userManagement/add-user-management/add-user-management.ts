import { Component } from '@angular/core';
import { UserManagement } from '../../../../core/services/admin/userManagement/user-management';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-user-management',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-user-management.html',
  styleUrl: './add-user-management.css',
})
export class AddUserManagement {

    userForm: FormGroup;
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: UserManagement,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    this.errors = [];

    this.adminService.addUser(this.userForm.value).subscribe({
      next: () => {
        

        alert('User added successfully');
        this.router.navigate(['/admin/userManagement']);
        
      },
      error: (err) => {
        // Laravel validation errors
       console.log(err);
       
      },
    });
  }

}
