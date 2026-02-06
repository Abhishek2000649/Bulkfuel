import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../../core/services/admin/product/product';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink, RouterModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct implements OnInit {

  productForm!: FormGroup;
  categories: any[] = [];
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: Product,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadCategories();
  }

  // 🔹 Form Creation
  createForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      description: [''],
    });
  }

  // 🔹 Load Categories from API
  loadCategories() {
    this.adminService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Category Load Error:', err);
      },
    });
  }

  // 🔹 Used in HTML Preview
  getCategoryName(id: any): string {
    return this.categories.find(c => c.id == id)?.name || 'CATEGORY';
  }

  // 🔹 Submit Product
  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.errors = [];

    const payload = this.productForm.value;

    this.adminService.addProduct(payload).subscribe({
      next: () => {
        alert('✅ Product added successfully');
        this.router.navigate(['/admin/product']);
      },
      error: (err: any) => {
        console.error(err);

        // Optional: backend validation errors
        if (err?.error?.errors) {
          this.errors = Object.values(err.error.errors).flat() as string[];
        }
      },
    });
  }
}
