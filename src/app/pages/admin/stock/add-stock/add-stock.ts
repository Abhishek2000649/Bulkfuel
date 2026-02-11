import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Stock } from '../../../../core/services/admin/stock/stock';
import { Router } from '@angular/router';
import { Spinner } from '../../../../shared/spinner/spinner';
import { pattern, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
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
    this.isLoading=true;
    this.adminService.getWarehouses().subscribe({
      next: (res) => {this.warehouses = res;
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: (err) =>
        {
          this.isLoading=false;
           console.error(err);
        }
      
    });
  }

  loadProducts() {
    this.isLoading=true;
    this.adminService.getProducts().subscribe({
      next: (res) => {this.products = res;
        this.isLoading=false;
        this.cdr.detectChanges();
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
        this.stockForm.markAllAsTouched();
      this.updateFormErrors();
        return;
      }

    this.errors = [];

    this.adminService.addStock(this.stockForm.value).pipe(
      finalize(()=>{
        this.isLoading=false;
        this.cdr.detectChanges();
      })
    ).subscribe({
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
