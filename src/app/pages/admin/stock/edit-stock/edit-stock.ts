import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Stock } from '../../../../core/services/admin/stock/stock';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
type StockFormFields = 'warehouse_id' | 'product_id' | 'stock_quantity';
@Component({
  selector: 'app-edit-stock',
  imports: [CommonModule, ReactiveFormsModule, Spinner, RouterLink],
  templateUrl: './edit-stock.html',
  styleUrl: './edit-stock.css',
})
export class EditStock {
@ViewChild('warehouseWrapper') warehouseWrapper!: ElementRef;
@ViewChild('productWrapper') productWrapper!: ElementRef;

@HostListener('document:click', ['$event'])
onClickOutside(event: Event): void {
  const target = event.target as HTMLElement;

  if (
    this.warehouseWrapper &&
    !this.warehouseWrapper.nativeElement.contains(target)
  ) {
    this.isWarehouseOpen = false;
  }

  if (
    this.productWrapper &&
    !this.productWrapper.nativeElement.contains(target)
  ) {
    this.isProductOpen = false;
  }
}
   stockForm!: FormGroup;
  stockId!: number;

  warehouses: any[] = [];
  products: any[] = [];
  errors: string[] = [];
  selectedWarehouse: string | null = null;
selectedProduct: string | null = null;
isWarehouseOpen = false;
isProductOpen = false;
  isLoading:boolean=false;
  formErrors: Record<StockFormFields, string> = {
    warehouse_id: '',
    product_id: '',
    stock_quantity: '',
  };
     validationMessages: Record<StockFormFields, any> = {
      warehouse_id: {
        required: 'Select warehouse',
      },
      product_id: {
        required: 'Select product',
      },
      stock_quantity: {
        required: 'Enter Quantity',
        pattern: 'Enter valid Quantity',
      }
    };
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private stockService: Stock,
    private cdr: ChangeDetectorRef,
  ) {
    this.stockForm = this.fb.group({
      warehouse_id: ['', Validators.required],
      product_id: ['', Validators.required],
      stock_quantity: ['', [Validators.required,  Validators.pattern(/^[0-9]+$/)]],
    });
    this.stockForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }
  selectWarehouse(w: any) {
  this.selectedWarehouse = w.name;
  this.stockForm.patchValue({ warehouse_id: w.id });
  this.isWarehouseOpen = false;
}

selectProduct(p: any) {
  this.selectedProduct = p.name;
  this.stockForm.patchValue({ product_id: p.id });
  this.isProductOpen = false;
}
  updateFormErrors(): void {
    (Object.keys(this.formErrors) as StockFormFields[]).forEach((field) => {
      const control = this.stockForm.get(field);
      this.formErrors[field] = '';

      if (control && control.invalid && (control.dirty || control.touched)) {
        const messages = this.validationMessages[field];

        if (control.errors) {
          for (const errorKey of Object.keys(control.errors)) {
            this.formErrors[field] = messages[errorKey];
            break; 
          }
        }
      }
    });
  }

  ngOnInit(): void {
  this.stockId = Number(this.route.snapshot.paramMap.get('id'));

  this.loadWarehousesAndProducts();
}

loadWarehousesAndProducts() {
  this.isLoading = true;

  this.stockService.getWarehouses().subscribe({
    next: (wRes: any) => {
      this.warehouses = wRes?.data || [];

      this.stockService.getProducts().subscribe({
        next: (pRes: any) => {
          this.products = pRes?.data || [];

          // ✅ Ab safe hai
          this.loadStock();
        }
      });
    }
  });
}

 loadWarehouses() {
  this.isLoading = true;

  this.stockService.getWarehouses().subscribe({
    next: (res: any) => {
      this.warehouses = res?.data || [];
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.isLoading = false;

      const errorMessage =
        err?.error?.message ||
        err?.message ||
        'Failed to load warehouses';

      Swal.fire({
        title: errorMessage,
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

 loadProducts() {
  this.isLoading = true;

  this.stockService.getProducts().subscribe({
    next: (res: any) => {
      this.products = res?.data || [];
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.isLoading = false;

      const errorMessage =
        err?.error?.message ||
        err?.message ||
        'Failed to load products';

      Swal.fire({
        title: errorMessage,
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

 loadStock() {
  this.isLoading = true;

  this.stockService.getStockById(this.stockId).subscribe({
    next: (res: any) => {

      const data = res?.data;

      if (data) {
        this.stockForm.patchValue({
          warehouse_id: data.warehouse_id,
          product_id: data.product_id,
          stock_quantity: data.stock_quantity,
        });

        // ✅ ADD THIS 👇
        const warehouse = this.warehouses.find(w => w.id === data.warehouse_id);
        const product = this.products.find(p => p.id === data.product_id);

        this.selectedWarehouse = warehouse?.name || null;
        this.selectedProduct = product?.name || null;
      }

      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

 onSubmit() {
  this.isLoading = true;

  if (this.stockForm.invalid) {
    this.stockForm.markAllAsTouched();
    this.updateFormErrors();
    this.isLoading = false;
    return;
  }

  this.errors = [];

  this.stockService.updateStock(this.stockId, this.stockForm.value)
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({

      // ✅ SUCCESS BLOCK (Logic Same)
      next: (res: any) => {

        const message =
          res?.message || 'Stock updated successfully';

        Swal.fire({
          title: message,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e'
        }).then(() => {
          this.router.navigate(['/admin/stock']);
        });
      },

      // ❌ ERROR BLOCK (Logic Same + Swal Added)
      error: (err) => {

        if (err.status === 422) {
          this.errors = [err.error.message];
        }

        const errorMessage =
          err?.error?.message ||
          err?.message ||
          'Something went wrong';

        Swal.fire({
          title: errorMessage,
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

}
