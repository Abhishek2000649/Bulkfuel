import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Admin } from '../../../../core/services/admin/admin';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-category',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './home-category.html',
  styleUrl: './home-category.css',
})
export class HomeCategory implements OnInit{
   categories: any[] = [];
  successMessage = '';

  constructor(private adminService: Admin,   private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
        console.log(res);
          this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    this.adminService.deleteCategory(id).subscribe({
      next: () => {
        this.successMessage = 'Category deleted successfully';
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

}
