import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/services/admin/product/product';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
type ProductFormFields = 'name' | 'price' | 'stock' | 'category_id' | 'description';
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

  formErrors: Record<ProductFormFields, string> = {
    name: '',
    price: '',
    stock: '',
    category_id: '',
    description: '',
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
    this.loadProduct();
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
    this.isLoading=true;
    this.adminService.getCategories().subscribe({
      next: (res) => {this.categories = res
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
         this.productForm.markAllAsTouched();
      this.updateFormErrors();
        return;
      }

    this.errors = [];

    this.adminService.updateProduct(this.productId, this.productForm.value).pipe(
      finalize(()=>{
        this.isLoading=false;
        this.cdr.detectChanges();
      })
    )
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
