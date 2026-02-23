import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/services/admin/product/product';
import { Spinner } from '../../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Spinner],
  templateUrl: './home-product.html',
  styleUrl: './home-product.css',
})
export class HomeProduct {

  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];

  selectedCategory: string = 'ALL';
  searchText: string = '';
  isLoading:boolean=false;
  defaultImage =
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9';

  constructor(
    private adminService: Product,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
  this.isLoading = true;

  this.adminService.getProducts().subscribe({
    next: (res: any) => {

      this.products = res.data || [];
      this.filteredProducts = res.data || [];

      // Extract unique categories
      const map = new Map<number, any>();

      (res.data || []).forEach((p: any) => {
        if (p.category) {
          map.set(p.category.id, p.category);
        }
      });

      this.categories = Array.from(map.values());

      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
       Swal.fire({
      title: err.error?.message || 'Failed to load products',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d4af37',
      background: 'linear-gradient(135deg, #3b0000, #1a0000)',
      color: '#ffffff',
      iconColor: '#ef4444'
    });
    },
  });
}

  onCategoryChange(categoryId: string) {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const matchCategory =
        this.selectedCategory === 'ALL' ||
        p.category?.id == this.selectedCategory;

      const matchSearch =
        p.name?.toLowerCase().includes(this.searchText.toLowerCase());

      return matchCategory && matchSearch;
    });
  }

deleteProduct(id: number) {

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#d4af37',
    cancelButtonColor: '#6b7280',
    background: 'linear-gradient(135deg, #3b0000, #1a0000)',
    color: '#ffffff',
    iconColor: '#f59e0b'
  }).then((result) => {

    if (result.isConfirmed) {

      this.isLoading = true;

      this.adminService.deleteProduct(id).subscribe({

        next: () => {
          this.isLoading = false;

          Swal.fire({
            title: 'Deleted!',
            text: 'Product has been deleted successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#22c55e'
          });

          this.loadProducts();
        },

        error: (err) => {
          this.isLoading = false;
          console.error(err);

          Swal.fire({
            title: err?.error?.message || 'Failed to delete product',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444'
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
