import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../../core/services/admin/product/product';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Spinner } from '../../../../shared/spinner/spinner';
import Swal from 'sweetalert2';
type ProductFormFields = 'name' | 'price' | 'stock' | 'category_id' | 'description' | 'payment_type';
@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule, Spinner],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct implements OnInit {
  // Payment dropdown state
isPaymentDropdownOpen = false;
selectedPaymentType: string = '';

// Payment options (dynamic)
paymentTypes = [
  { label: 'Cash (COD)', value: 'cash' },
  { label: 'Online Payment', value: 'online' },
  { label: 'Both', value: 'both' }
];

@ViewChild('paymentDropdownWrapper') paymentDropdownRef!: ElementRef;

// Toggle
togglePaymentDropdown() {
  this.isPaymentDropdownOpen = !this.isPaymentDropdownOpen;
}

// Select
selectPaymentType(p: any) {
  this.selectedPaymentType = p.label;
  this.productForm.patchValue({
    payment_type: p.value
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
      if (this.paymentDropdownRef && !this.paymentDropdownRef.nativeElement.contains(target)) {
    this.isPaymentDropdownOpen = false;
  }
  }

  productForm!: FormGroup;
  categories: any[] = [];
  errors: string[] = [];
  isLoading: boolean = false;
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
    private adminService: Product,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.createForm();
    this.productForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

  ngOnInit(): void {

    this.loadCategories();
     const defaultPayment = this.paymentTypes.find(p => p.value === 'both');
  this.selectedPaymentType = defaultPayment?.label || '';
  }

  // 🔹 Form Creation
  createForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/),]],
      stock: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)]],
      category_id: ['', Validators.required],
      description: ['', Validators.required],
      payment_type: ['both', Validators.required],
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

  // 🔹 Load Categories from API
  loadCategories() {
    this.isLoading = true;

    this.adminService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Category Load Error:', err);

        Swal.fire({
          title: err?.error?.message || 'Failed to load categories',
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

  // 🔹 Used in HTML Preview
  getCategoryName(id: any): string {
    return this.categories.find(c => c.id == id)?.name || 'CATEGORY';
  }

  // 🔹 Submit Product
  onSubmit() {
    this.isLoading = true;

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading = false;
      return;
    }

    this.errors = [];
    const payload = this.productForm.value;

    this.adminService.addProduct(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        Swal.fire({
          title: res?.message || 'Product added successfully',
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

      error: (err: any) => {
        this.isLoading = false;
        console.error(err);

        // Backend validation errors
        if (err?.error?.errors) {
          this.errors = Object.values(err.error.errors).flat() as string[];
        }

        Swal.fire({
          title: err?.error?.message || 'Failed to add product',
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

  selectCategory(category: any) {
    this.selectedCategory = category.name;
    this.productForm.patchValue({
      category_id: category.id
    });
    this.isDropdownOpen = false;
  }
}
