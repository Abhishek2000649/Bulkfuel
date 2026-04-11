import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UserManagement } from '../../../../core/services/admin/userManagement/user-management';
import { RouterModule } from '@angular/router';
import { Spinner } from '../../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-user-management',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Spinner],
  templateUrl: './home-user-management.html',
  styleUrl: './home-user-management.css',
})
export class HomeUserManagement {

    users: any[] = [];
    allUsers: any[] = [];
  successMessage = '';
  errorMessage = '';
  isLoading:boolean= false;
  constructor(private adminService: UserManagement, private cdr:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
  this.isLoading = true;

  this.adminService.getUsers().subscribe({

    next: (res: any) => {
      this.users = res.data || res;  
      this.allUsers = res.data || res; 
      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: (err: any) => {

      this.isLoading = false;

      Swal.fire({
        title: err.error?.message || 'Failed to load users',
        icon: 'error',
        showConfirmButton: false,
        timer: 4000,
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        timerProgressBar: false,
      });

    }

  });
}


  deleteUser(id: number) {

  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this user!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d4af37',
    cancelButtonColor: '#6b7280',
    background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {

    if (result.isConfirmed) {

      this.isLoading = true;

      this.adminService.deleteUser(id).subscribe({

        next: (res: any) => {

          this.isLoading = false;

          Swal.fire({
            title: res?.message || 'User deleted successfully',
           icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',   
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e',
          });

          this.loadUsers();
        },

        error: (err: any) => {

          this.isLoading = false;

          Swal.fire({
            title: err.error?.message || 'Cannot delete user',
            icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d4af37',
      background: 'linear-gradient(135deg, #3b0000, #1a0000)',
      color: '#ffffff',
      iconColor: '#ef4444',
          });

        }

      });

    }

  });

}


  trackById(index: number, item: any) {
    return item.id;
  }
  searchUsers(event: any) {

  const searchValue = event.target.value.toLowerCase();

  if (!searchValue) {
    this.users = this.allUsers;
    return;
  }

  this.users = this.allUsers.filter((user: any) =>
    user.name.toLowerCase().includes(searchValue) ||
    user.email.toLowerCase().includes(searchValue) ||
    user.role.toLowerCase().includes(searchValue)
  );
}

}


// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { Spinner } from '../../../../shared/spinner/spinner';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-home-user-management',
//    imports: [CommonModule, ReactiveFormsModule, RouterModule, ],
//   templateUrl: './home-user-management.html',
// })
// export class HomeUserManagement {

//   userForm!: FormGroup;

//   dashboards = [
//     { id: 1, name: 'Admin Dashboard' },
//     { id: 2, name: 'Bank Dashboard' },
//     { id: 3, name: 'Vendor Dashboard' }
//   ];

//   allRoles = [
//     { role_id: 1, dashboard_id: 1, role_name: 'Admin' },
//     { role_id: 2, dashboard_id: 2, role_name: 'Bank User' },
//     { role_id: 3, dashboard_id: 3, role_name: 'Vendor User' }
//   ];

//   dashboardRoleSelections: any[] = [];

//   passwordType = 'password';

//   constructor(private fb: FormBuilder) {

//     this.userForm = this.fb.group({
//       name: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       phone: ['', Validators.required],
//       designation: ['', Validators.required],
//       password: ['', Validators.required],
//       confirmPassword: ['', Validators.required],
//     }, { validators: this.passwordMatchValidator });

//     this.addRow();
//   }

//   passwordMatchValidator(form: FormGroup) {
//     const pass = form.get('password')?.value;
//     const confirm = form.get('confirmPassword')?.value;
//     return pass === confirm ? null : { mismatch: true };
//   }

//   addRow() {
//     this.dashboardRoleSelections.push({
//       selectedDashboard: null,
//       selectedRole: null,
//       roles: []
//     });
//   }

//   onDashboardChange(index: number) {
//     const dashboardId = this.dashboardRoleSelections[index].selectedDashboard;

//     this.dashboardRoleSelections[index].roles =
//       this.allRoles.filter(r => r.dashboard_id == dashboardId);

//     this.dashboardRoleSelections[index].selectedRole = null;
//   }

//   removeRow(index: number) {
//     this.dashboardRoleSelections.splice(index, 1);
//   }

//   onSubmit() {
//     if (this.userForm.invalid) {
//       alert('Please fill all fields correctly');
//       return;
//     }

//     const dashboards = this.dashboardRoleSelections.map(item => ({
//       dashboard_id: item.selectedDashboard,
//       role_id: item.selectedRole
//     }));

//     const finalData = {
//       ...this.userForm.value,
//       dashboards
//     };

//     console.log('Submitted Data:', finalData);
//     alert('Form Submitted Successfully ✅');

//     this.userForm.reset();
//     this.dashboardRoleSelections = [];
//     this.addRow();
//   }

//   togglePassword() {
//     this.passwordType =
//       this.passwordType === 'password' ? 'text' : 'password';
//   }

//   generatePassword() {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
//     let password = '';

//     for (let i = 0; i < 8; i++) {
//       password += chars[Math.floor(Math.random() * chars.length)];
//     }

//     this.userForm.patchValue({
//       password,
//       confirmPassword: password
//     });
//   }
// }