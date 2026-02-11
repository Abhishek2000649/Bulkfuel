import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Stock } from '../../../../core/services/admin/stock/stock';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
type StockFormFields = 'warehouse_id' | 'product_id' | 'stock_quantity';
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
         this.stockForm.markAllAsTouched();
      this.updateFormErrors();
        this.isLoading=false;
        return;
      }

    this.errors = [];

    this.stockService.updateStock(this.stockId, this.stockForm.value).pipe(
          finalize(()=>{
            this.isLoading=false;
            this.cdr.detectChanges();
          })
        )
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
