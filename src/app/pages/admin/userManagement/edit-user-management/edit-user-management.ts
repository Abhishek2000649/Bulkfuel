import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserManagement } from '../../../../core/services/admin/userManagement/user-management';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user-management',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-user-management.html',
  styleUrl: './edit-user-management.css',
})
export class EditUserManagement {

    userForm!: FormGroup;
  userId!: number;
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: UserManagement
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });

    this.loadUser();
  }

  loadUser() {
    this.adminService.getUserById(this.userId).subscribe({
      next: (res) => {
        this.userForm.patchValue({
          name: res.name,
          email: res.email,
          role: res.role,
        });
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    this.errors = [];

    this.adminService.updateUser(this.userId, this.userForm.value)
      .subscribe({
        next: () => {
          alert('User updated successfully');
          this.router.navigate(['/admin/userManagement']);
        },
        error: (err) => {
          console.log(err);
          
        },
      });
  }

}
