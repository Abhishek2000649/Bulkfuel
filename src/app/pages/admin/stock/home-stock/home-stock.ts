import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Stock } from '../../../../core/services/admin/stock/stock';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-home-stock',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Spinner ],
  templateUrl: './home-stock.html',
  styleUrl: './home-stock.css',
})
export class HomeStock {

  stocks: any[] = [];
  searchTerm = '';
  errorMessage = '';
  isLoading:boolean= false;
  constructor(
    private stockService: Stock,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStocks();
      
  }

  loadStocks() {
     this.isLoading = true;
    this.stockService.getStocks().subscribe({
      next: (res) => {

        this.stocks = res;
        this.isLoading = false;
        this.cdr.detectChanges();
         
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load stock';
        this.isLoading = false;
      },
    });
  }

  deleteStock(id: number) {
    this.isLoading=true;
    if (!confirm('Delete this stock?')) 
      {
        this.isLoading=false;
        return;
      }

    this.stockService.deleteStock(id).subscribe({
      next: () =>
        {
          this.isLoading=false;
        this.loadStocks()
        },
      error: (err) => {
        this.isLoading=false;
        this.errorMessage = err.error?.message || 'Delete failed';
      },
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  /* ================= COMPUTED ================= */

  get filteredStocks() {
    return this.stocks.filter(item =>
      item.product?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.warehouse?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
