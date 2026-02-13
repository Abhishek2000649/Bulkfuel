import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Admin } from '../../../../core/services/admin/admin';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
type CategoryFormFields = 'name';
@Component({
  selector: 'app-edit-category',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, Spinner],
  templateUrl: './edit-category.html',
  styleUrl: './edit-category.css',
})
export class EditCategory {

    categoryForm!: FormGroup;
  categoryId!: number;
  isLoading:boolean=false;
  formErrors: Record<CategoryFormFields, string> = {
    name: '',
    
  };
  validationMessages: Record<CategoryFormFields, any> = {
      name: {
        required: 'Enter category name',
        pattern: 'Enter a valid category name without special character',
      },
      
    };
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: Admin,
    private cdr:ChangeDetectorRef,
  ) {
    this.categoryForm = this.fb.group({
  name: [
    '',
    [
      Validators.required,
      Validators.pattern(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/)
    ]
  ],
});

     this.categoryForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }
updateFormErrors(): void {
    (Object.keys(this.formErrors) as CategoryFormFields[]).forEach((field) => {
      const control = this.categoryForm.get(field);
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
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));

    // this.categoryForm = this.fb.group({
    //   name: ['', Validators.required],
    // });

    this.loadCategory();
  }

  loadCategory() {

  this.isLoading = true;

  this.adminService.getCategoryById(this.categoryId).subscribe({

    next: (res: any) => {

      // API अगर { success, data } structure दे रहा है
      const category = res?.data || res;

      this.categoryForm.patchValue({
        name: category?.name
      });

      this.isLoading = false;
    },

    error: (err: any) => {

      this.isLoading = false;

      Swal.fire({
        title: err.error?.message || 'Failed to load category',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444'
      });

      console.error(err);
    }

  });

}


  onSubmit() {

  this.isLoading = true;

  if (this.categoryForm.invalid) {
    this.categoryForm.markAllAsTouched();
    this.updateFormErrors();
    this.isLoading = false;
    return;
  }

  this.adminService.updateCategory(this.categoryId, this.categoryForm.value)
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({

      // ✅ SUCCESS
      next: (res: any) => {

        Swal.fire({
          title: res?.message || 'Category updated successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e'
        }).then(() => {
          this.router.navigate(['/admin/category']);
        });

      },

      // ❌ ERROR
      error: (err: any) => {

        Swal.fire({
          title: err.error?.message || 'Failed to update category',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        });

        console.error(err);
      }

    });

}

}
