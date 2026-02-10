import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Stock } from '../../../../core/services/admin/stock/stock';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-edit-stock',
  imports: [CommonModule, ReactiveFormsModule, Spinner],
  templateUrl: './edit-stock.html',
  styleUrl: './edit-stock.css',
})
export class EditStock {

   stockForm!: FormGroup;
  stockId!: number;

  warehouses: any[] = [];
  products: any[] = [];
  errors: string[] = [];
  isLoading:boolean=false;
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
    this.isLoading=true;
    this.stockService.getWarehouses().subscribe({
      next: (res) => 
        {
          this.isLoading=false;
          this.warehouses = res
        },
      error: (err) =>
        {
          this.isLoading=false;
           console.error(err)
          }
    });
  }

  loadProducts() {
    this.isLoading=true;
    this.stockService.getProducts().subscribe({
      next: (res) =>
        { 
          this.isLoading=false;
          this.products = res},
      error: (err) => 
        {
          this.isLoading=false;
          console.error(err);
        },
    });
  }

  loadStock() {
    this.isLoading=true;
    this.stockService.getStockById(this.stockId).subscribe({
      next: (res) => {
        this.stockForm.patchValue({
          warehouse_id: res.warehouse_id,
          product_id: res.product_id,
          stock_quantity: res.stock_quantity,
        });
        this.isLoading=false;
      },
      error: (err) => 
        {
          this.isLoading=false;
          console.error(err);
        }
    });
  }

  onSubmit() {
    this.isLoading=true;
    if (this.stockForm.invalid) 
      {
        this.isLoading=false;
        return;
      }

    this.errors = [];

    this.stockService.updateStock(this.stockId, this.stockForm.value)
      .subscribe({
        next: () => {
          this.isLoading=false;
          alert('Stock updated successfully');
          this.router.navigate(['/admin/stock']);
        },
        error: (err) => {
          this.isLoading=false;
          if (err.status === 422) {
            this.errors = [err.error.message];
          }
        },
      });
  }

}
