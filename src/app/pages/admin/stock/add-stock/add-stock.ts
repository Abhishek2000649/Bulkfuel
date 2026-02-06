import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Stock } from '../../../../core/services/admin/stock/stock';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-stock',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-stock.html',
  styleUrl: './add-stock.css',
})
export class AddStock {

    stockForm!: FormGroup;
  warehouses: any[] = [];
  products: any[] = [];
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: Stock,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.stockForm = this.fb.group({
      warehouse_id: ['', Validators.required],
      product_id: ['', Validators.required],
      stock_quantity: ['', Validators.required],
    });

    this.loadWarehouses();
    this.loadProducts();
  }

  loadWarehouses() {
    this.adminService.getWarehouses().subscribe({
      next: (res) => {this.warehouses = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
      
    });
  }

  loadProducts() {
    this.adminService.getProducts().subscribe({
      next: (res) => {this.products = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  onSubmit() {
    if (this.stockForm.invalid) return;

    this.errors = [];

    this.adminService.addStock(this.stockForm.value).subscribe({
      next: () => {
        alert('Stock added successfully');
        this.router.navigate(['/admin/stock']);
      },
      error: (err) => {
        console.log(err);
         if (err.status === 422) {
      this.errors = [err.error.message];
      this.cdr.detectChanges();
    }
      },
    });
  }

}
