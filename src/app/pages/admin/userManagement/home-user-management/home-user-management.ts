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

}
