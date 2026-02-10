import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Admin } from '../../../../core/services/admin/admin';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../../shared/spinner/spinner';

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
    this.isLoading=true;
    this.adminService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
        console.log(res);
        this.isLoading=false;
          this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading=false;
        console.error(err);
      },
    });
  }

  deleteCategory(id: number) {
    this.isLoading=true;
    if (!confirm('Are you sure you want to delete this category?')) {
      this.isLoading=false;
      return;
    }

    this.adminService.deleteCategory(id).subscribe({
      next: () => {
        this.isLoading=false;
        this.successMessage = 'Category deleted successfully';
        this.loadCategories();
      },
      error: (err) => {
        this.isLoading=false;
        console.error(err);
      },
    });
  }

}
