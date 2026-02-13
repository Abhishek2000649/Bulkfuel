import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Admin } from '../../../../core/services/admin/admin';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-category',
  imports: [CommonModule, RouterModule, Spinner],
  standalone: true,
  templateUrl: './home-category.html',
  styleUrl: './home-category.css',
})
export class HomeCategory implements OnInit{
   categories: any[] = [];
  successMessage = '';
  isLoading:boolean=false;
  constructor(private adminService: Admin,   private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCategories();
  }

 loadCategories() {

  this.isLoading = true;

  this.adminService.getCategories().subscribe({

    next: (res: any) => {
      this.categories = res.data ||0;  
      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: (err: any) => {

      this.isLoading = false;

      Swal.fire({
        title: err.error?.message || 'Failed to load categories',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444'
      });

      console.error(err);
    }

  });

}


 deleteCategory(id: number) {

  Swal.fire({
    title: 'Are you sure?',
    text: 'You want to delete this category?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#d4af37',
    cancelButtonColor: '#6b7280',
    background: 'linear-gradient(135deg, #3b0000, #1a0000)',
    color: '#ffffff'
  }).then((result) => {

    if (result.isConfirmed) {

      this.isLoading = true;

      this.adminService.deleteCategory(id).subscribe({

        // ✅ SUCCESS
        next: (res: any) => {

          this.isLoading = false;

          Swal.fire({
            title: res?.message || 'Category deleted successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#22c55e'
          });

          this.loadCategories();
        },

        // ❌ ERROR
        error: (err: any) => {

          this.isLoading = false;

          Swal.fire({
            title: err.error?.message || 'Failed to delete category',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444'
          });

          console.error(err);
        }

      });

    }

  });

}


}
