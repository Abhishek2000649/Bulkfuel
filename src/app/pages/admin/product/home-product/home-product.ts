import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/services/admin/product/product';

@Component({
  selector: 'app-home-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home-product.html',
  styleUrl: './home-product.css',
})
export class HomeProduct {

  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];

  selectedCategory: string = 'ALL';
  searchText: string = '';

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
    this.adminService.getProducts().subscribe({
      next: (res: any[]) => {
        this.products = res;
        this.filteredProducts = res;

        // extract unique categories
        const map = new Map<number, any>();
        res.forEach(p => {
          if (p.category) {
            map.set(p.category.id, p.category);
          }
        });

        this.categories = Array.from(map.values());
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
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
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.adminService.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error(err),
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
