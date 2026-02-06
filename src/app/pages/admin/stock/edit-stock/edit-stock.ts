import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Stock } from '../../../../core/services/admin/stock/stock';

@Component({
  selector: 'app-edit-stock',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-stock.html',
  styleUrl: './edit-stock.css',
})
export class EditStock {

   stockForm!: FormGroup;
  stockId!: number;

  warehouses: any[] = [];
  products: any[] = [];
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private stockService: Stock
  ) {}

  ngOnInit(): void {
    this.stockId = Number(this.route.snapshot.paramMap.get('id'));

    this.stockForm = this.fb.group({
      warehouse_id: ['', Validators.required],
      product_id: ['', Validators.required],
      stock_quantity: ['', [Validators.required, Validators.min(1)]],
    });

    this.loadWarehouses();
    this.loadProducts();
    this.loadStock();
  }

  loadWarehouses() {
    this.stockService.getWarehouses().subscribe({
      next: (res) => (this.warehouses = res),
      error: (err) => console.error(err),
    });
  }

  loadProducts() {
    this.stockService.getProducts().subscribe({
      next: (res) => (this.products = res),
      error: (err) => console.error(err),
    });
  }

  loadStock() {
    this.stockService.getStockById(this.stockId).subscribe({
      next: (res) => {
        this.stockForm.patchValue({
          warehouse_id: res.warehouse_id,
          product_id: res.product_id,
          stock_quantity: res.stock_quantity,
        });
      },
      error: (err) => console.error(err),
    });
  }

  onSubmit() {
    if (this.stockForm.invalid) return;

    this.errors = [];

    this.stockService.updateStock(this.stockId, this.stockForm.value)
      .subscribe({
        next: () => {
          alert('Stock updated successfully');
          this.router.navigate(['/admin/stock']);
        },
        error: (err) => {
          if (err.status === 422) {
            this.errors = [err.error.message];
          }
        },
      });
  }

}
