import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UserManagement } from '../../../../core/services/admin/userManagement/user-management';
import { RouterModule } from '@angular/router';
import { Spinner } from '../../../../shared/spinner/spinner';

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
    this.isLoading=true;
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading=false;
        this.errorMessage = 'Failed to load users';
      },
    });
  }

  deleteUser(id: number) {
    this.isLoading=true;
    if (!confirm('Are you sure?')) {
      this.isLoading=false;
      return;
    }

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.successMessage = 'User deleted successfully';
        this.isLoading=false;
        this.loadUsers();
      },
      error: (err) => {
        this.isLoading=false;
        this.errorMessage = err.error?.message || 'Cannot delete user';
      },
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }

}
