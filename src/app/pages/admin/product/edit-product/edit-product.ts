import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/services/admin/product/product';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-edit-product',
  imports: [CommonModule, ReactiveFormsModule, Spinner],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct {

   productForm!: FormGroup;
  productId!: number;
  categories: any[] = [];
  errors: string[] = [];
  isLoading:boolean=false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: Product
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      stock: ['', Validators.required],
      category_id: ['', Validators.required],
      description: [''],
    });

    this.loadCategories();
    this.loadProduct();
  }

  loadCategories() {
    this.isLoading=true;
    this.adminService.getCategories().subscribe({
      next: (res) => {this.categories = res
        this.isLoading=false;

      },
      error: (err) => 
        {
          this.isLoading=false;
          console.error(err);
        }
    });
  }

  loadProduct() {
    this.isLoading=true;
    this.adminService.getProductById(this.productId).subscribe({
      next: (res) => {
        this.productForm.patchValue({
          name: res.name,
          price: res.price,
          stock: res.stock,
          category_id: res.category_id,
          description: res.description,
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
    if (this.productForm.invalid) 
      {
        this.isLoading=false;
        return;
      }

    this.errors = [];

    this.adminService.updateProduct(this.productId, this.productForm.value)
      .subscribe({
        next: () => {
          this.isLoading=false;
          alert('Product updated successfully');
          this.router.navigate(['/admin/product']);
        },
        error: (err) => {
          this.isLoading=false;
         console.log(err);
         
        },
      });
  }

}
