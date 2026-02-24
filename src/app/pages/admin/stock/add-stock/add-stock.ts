import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Stock } from '../../../../core/services/admin/stock/stock';
import { Router } from '@angular/router';
import { Spinner } from '../../../../shared/spinner/spinner';
import { pattern, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
type StockFormFields = 'warehouse_id' | 'product_id' | 'stock_quantity';
@Component({
  selector: 'app-add-stock',
  imports: [CommonModule, ReactiveFormsModule, Spinner],
  templateUrl: './add-stock.html',
  styleUrl: './add-stock.css',
})
export class AddStock {

    stockForm!: FormGroup;
  warehouses: any[] = [];
  products: any[] = [];
  errors: string[] = [];
  isLoading:boolean= false;
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
    private adminService: Stock,
    private router: Router,
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

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadProducts();
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

loadWarehouses() {
  this.isLoading = true;

  this.adminService.getWarehouses().subscribe({
    next: (res: any) => {
      this.warehouses = res?.data || [];
      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.isLoading = false;
      console.error(err);

      let errorMessage = err?.error?.message || 
                         'Failed to load warehouses. Please try again.';

      // ✅ Same Styled Swal
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

  this.adminService.getProducts().subscribe({
    next: (res: any) => {
      this.products = res?.data || [];
      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.isLoading = false;
      console.error(err);

   
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

onSubmit() {
  this.isLoading = true;

  if (this.stockForm.invalid) {
    this.isLoading = false;
    this.stockForm.markAllAsTouched();
    this.updateFormErrors();
    return;
  }

  this.adminService.addStock(this.stockForm.value)
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (res: any) => {

        const successMessage =
          res?.message || 'Stock added successfully';

        Swal.fire({
          title: successMessage,
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

      
      error: (err) => {
        console.log(err);

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
