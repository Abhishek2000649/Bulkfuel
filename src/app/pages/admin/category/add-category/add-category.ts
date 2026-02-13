import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Admin } from '../../../../core/services/admin/admin';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Spinner } from '../../../../shared/spinner/spinner';
import { pattern } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
type CategoryFormFields = 'name';
@Component({
  selector: 'app-add-category',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, Spinner],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css',
})
export class AddCategory {

  categoryForm: FormGroup;
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
    private adminService: Admin,
    private router:Router,
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


 onSubmit() {

  this.isLoading = true;

  if (this.categoryForm.invalid) {
    this.categoryForm.markAllAsTouched();
    this.updateFormErrors();
    this.isLoading = false;
    return;
  }

  this.adminService.addCategory(this.categoryForm.value)
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
          title: res?.message || 'Category added successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e'
        }).then(() => {
          this.categoryForm.reset();
          this.router.navigate(['/admin/category/']);
        });

      },

      // ❌ ERROR
      error: (err: any) => {

        Swal.fire({
          title: err.error?.message || 'Failed to add category',
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
