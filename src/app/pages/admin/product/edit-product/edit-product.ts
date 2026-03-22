import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../../../core/services/admin/product/product';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
type ProductFormFields = 'name' | 'price' | 'stock' | 'category_id' | 'description'|  'payment_type';
@Component({
  selector: 'app-edit-product',
  imports: [CommonModule, ReactiveFormsModule, Spinner, RouterModule],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct {
@ViewChild('paymentDropdownWrapper') paymentDropdownWrapper!: ElementRef;
  // PAYMENT DROPDOWN STATE
isPaymentDropdownOpen = false;
selectedPaymentType: string = '';

// OPTIONS
paymentTypes = [
  { label: 'Cash (COD)', value: 'cash' },
  { label: 'Online Payment', value: 'online' },
  { label: 'Both', value: 'both' }
];

// TOGGLE
togglePaymentDropdown() {
  this.isPaymentDropdownOpen = !this.isPaymentDropdownOpen;
}

// SELECT
selectPaymentType(payment: any) {
  this.selectedPaymentType = payment.label;

  this.productForm.patchValue({
    payment_type: payment.value
  });

  this.isPaymentDropdownOpen = false;
}
 @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;

@HostListener('document:click', ['$event'])
clickOutside(event: Event): void {

  const target = event.target as HTMLElement;

  if (this.dropdownWrapper && !this.dropdownWrapper.nativeElement.contains(target)) {
    this.isDropdownOpen = false;
  }
   if (this.paymentDropdownWrapper && !this.paymentDropdownWrapper.nativeElement.contains(target)) {
    this.isPaymentDropdownOpen = false;
  }

}
   productForm!: FormGroup;
  productId!: number;
  categories: any[] = [];
  errors: string[] = [];
  isLoading:boolean=false;

  formErrors: Record<ProductFormFields, string> = {
    name: '',
    price: '',
    stock: '',
    category_id: '',
    description: '',
     payment_type: '',
  };
  validationMessages: Record<ProductFormFields, any> = {
    name: {
      required: 'Enter name',
    },
    price: {
      required: 'Enter price',
      pattern: 'Enter valid Price',
    },
    stock: {
      required: 'Enter stock',
      pattern: 'Enter valid quantity',
    },
    category_id: {
      required: 'Select any category',
    },
    description: {
      required: ' Enter Description',
    },
     payment_type: {
      required: 'Select payment type'
    }
  };
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: Product,
    private cdr:ChangeDetectorRef,
  ) {
    this.createForm();
    this.productForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));

   

    this.loadCategories();
  }
  createForm() {
  this.productForm = this.fb.group({
    name: ['', [Validators.required]],

    price: [
      '',
      [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+$/)
      ]
    ],

    stock: [
      '',
      [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+$/)
      ]
    ],

    category_id: ['', [Validators.required]],

    description: ['', [Validators.required]],
     payment_type: ['', [Validators.required]],
  });
}


  updateFormErrors(): void {
    (Object.keys(this.formErrors) as ProductFormFields[]).forEach((field) => {
      const control = this.productForm.get(field);
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

loadCategories() {
  this.isLoading = true;

  this.adminService.getCategories().subscribe({
    next: (res: any) => {

      this.categories = res.data || [];

      this.loadProduct();   // ✅ call here

      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.isLoading = false;
      console.error(err);
    }
  });
}

 loadProduct() {
  this.isLoading = true;

  this.adminService.getProductById(this.productId).subscribe({
    next: (res: any) => {

      const product = res.data.product;

      this.productForm.patchValue({
        name: product.name,
        price: Math.floor(product.price),
        stock: product.stock,
        category_id: product.category_id,
        description: product.description,
        payment_type: product.payment_type,
      });

      // ✅ Category set
      const category = this.categories.find(c => c.id == product.category_id);
      if (category) {
        this.selectedCategory = category.name;
      }

      // ✅ Payment set (THIS WAS MISSING 🔥)
      const payment = this.paymentTypes.find(
        p => p.value === product.payment_type
      );

      if (payment) {
        this.selectedPaymentType = payment.label;
      }

      this.isLoading = false;
    },

    error: (err) => {
      this.isLoading = false;
      console.error(err);
    }
  });
}

onSubmit() {
  this.isLoading = true;

  if (this.productForm.invalid) {
    this.isLoading = false;
    this.productForm.markAllAsTouched();
    this.updateFormErrors();

    return;
  }

  this.errors = [];

  this.adminService.updateProduct(this.productId, this.productForm.value)
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (res: any) => {   // ✅ response receive here

        Swal.fire({
          title: res?.message || 'Product updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e'
        }).then(() => {
          this.router.navigate(['/admin/product']);
        });

      },
      error: (err) => {

        Swal.fire({
          title: err.error?.message || 'Failed to update product',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        });
      },
    });
}
isDropdownOpen = false;
selectedCategory: string = '';

selectCategory(category:any){
this.selectedCategory = category.name;
this.productForm.patchValue({
category_id: category.id
});
this.isDropdownOpen = false;
}
}
