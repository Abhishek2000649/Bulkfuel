import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
   @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;

@HostListener('document:click', ['$event'])
clickOutside(event: Event): void {

  const target = event.target as HTMLElement;

  if (this.dropdownWrapper && !this.dropdownWrapper.nativeElement.contains(target)) {
    this.isDropdownOpen = false;
  }

}

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

  const data = res.data || [];  // ✅ define data

  // 🔥 Sort latest first
  this.products = data.sort((a: any, b: any) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  this.filteredProducts = [...this.products]; // ✅ use sorted data

  // Extract unique categories
  const map = new Map<number, any>();

  data.forEach((p: any) => {
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

  

 applyFilters() {

  this.filteredProducts = this.products.filter(p => {

    const matchCategory =
      !this.selectedCategoryId ||
      p.category?.id === this.selectedCategoryId;

    const matchSearch =
      !this.searchText ||
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

  isDropdownOpen = false;

selectedCategoryId: number | null = null;
selectedCategoryName: string = '';

selectCategory(category: any) {

  if (category) {
    this.selectedCategoryId = category.id;
    this.selectedCategoryName = category.name;
  } else {
    this.selectedCategoryId = null;
    this.selectedCategoryName = 'All';
  }

  this.isDropdownOpen = false;

  this.applyFilters();
}
}
