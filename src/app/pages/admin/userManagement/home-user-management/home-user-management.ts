import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UserManagement } from '../../../../core/services/admin/userManagement/user-management';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-user-management',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home-user-management.html',
  styleUrl: './home-user-management.css',
})
export class HomeUserManagement {

    users: any[] = [];
  successMessage = '';
  errorMessage = '';

  constructor(private adminService: UserManagement, private cdr:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load users';
      },
    });
  }

  deleteUser(id: number) {
    if (!confirm('Are you sure?')) {
      return;
    }

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.successMessage = 'User deleted successfully';
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Cannot delete user';
      },
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }

}
