import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Stock } from '../../../../core/services/admin/stock/stock';
import { Spinner } from '../../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-stock',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Spinner],
  templateUrl: './home-stock.html',
  styleUrl: './home-stock.css',
})
export class HomeStock {
  @ViewChild('categoryDropdown') categoryDropdown!: ElementRef;
  @ViewChild('warehouseDropdown') warehouseDropdown!: ElementRef;
  categories: any[] = [];
  warehouses: any[] = [];

  selectedCategory: any = null;
  selectedWarehouse: any = null;

  isCategoryOpen = false;
  isWarehouseOpen = false;
  stocks: any[] = [];
  searchTerm = '';
  errorMessage = '';
  isLoading: boolean = false;
  constructor(
    private stockService: Stock,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadStocks();

  }
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {

    const target = event.target as HTMLElement;

    // Category dropdown close
    if (this.categoryDropdown &&
      !this.categoryDropdown.nativeElement.contains(target)) {
      this.isCategoryOpen = false;
    }

    // Warehouse dropdown close
    if (this.warehouseDropdown &&
      !this.warehouseDropdown.nativeElement.contains(target)) {
      this.isWarehouseOpen = false;
    }

  }
  loadStocks() {
    this.isLoading = true;

    this.stockService.getStocks().subscribe({
      next: (res: any) => {
        this.stocks = res.data || [];

        // ✅ unique categories
        this.categories = [
          ...new Map(this.stocks.map(s => [s.product?.category?.name, {
            id: s.product?.category_id,
            name:  s.product?.category?.name
          }])).values()
        ];

        // ✅ unique warehouses
        this.warehouses = [
          ...new Map(this.stocks.map(s => [s.warehouse?.id, s.warehouse])).values()
        ];

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  selectCategory(cat: any) {
    this.selectedCategory = cat;
    this.isCategoryOpen = false;
  }

  selectWarehouse(w: any) {
    this.selectedWarehouse = w;
    this.isWarehouseOpen = false;
  }

  get selectedCategoryName() {
    return this.selectedCategory?.name;
  }

  get selectedWarehouseName() {
    return this.selectedWarehouse?.name;
  }



  deleteStock(id: number) {


    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this stock?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#6b7280',
      background: 'linear-gradient(135deg, #3b0000, #1a0000)',
      color: '#ffffff',
      iconColor: '#f59e0b'
    }).then((result) => {

      if (result.isConfirmed) {
        this.isLoading = true;
      }
      else {
        return;
      }


      this.stockService.deleteStock(id).subscribe({
        next: () => {
          this.isLoading = false;

          // ✅ Success Swal
          Swal.fire({
            title: 'Deleted Successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444'
          });

          this.loadStocks();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Delete failed';

          // ✅ Error Swal
          Swal.fire({
            title: this.errorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444'
          });
        },
      });

    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  /* ================= COMPUTED ================= */

  get filteredStocks() {
    return this.stocks.filter(item => {

      const matchSearch =
        item.product?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.warehouse?.name?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchCategory =
        !this.selectedCategory ||
        item.product?.category_id === this.selectedCategory.id;

      const matchWarehouse =
        !this.selectedWarehouse ||
        item.warehouse?.id === this.selectedWarehouse.id;

      return matchSearch && matchCategory && matchWarehouse;
    });
  }

  get totalStock() {
    return this.stocks.reduce((sum, s) => sum + s.stock_quantity, 0);
  }

  get lowStockCount() {
    return this.stocks.filter(s => s.stock_quantity > 0 && s.stock_quantity < 20).length;
  }

  get warehouseCount() {
    return new Set(this.stocks.map(s => s.warehouse?.id)).size;
  }
}
