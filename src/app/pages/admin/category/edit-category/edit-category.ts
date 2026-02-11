import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Admin } from '../../../../core/services/admin/admin';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
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
    this.isLoading=true;
    this.adminService.getCategoryById(this.categoryId).subscribe({
      next: (res) => {
        this.categoryForm.patchValue({
          name: res.name,
        });
        this.isLoading=false;
      },
      error: (err) => {
        this.isLoading=false;
        console.error(err);
      },
    });
  }

  onSubmit() {
    this.isLoading=true;
    if (this.categoryForm.invalid) {
       this.categoryForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading=false;
      return;
    }

    this.adminService.updateCategory(this.categoryId, this.categoryForm.value).pipe(
          finalize(()=>{
            this.isLoading=false;
            this.cdr.detectChanges();
          }))
      .subscribe({
        next: () => {
          this.isLoading=false;
          alert('Category updated successfully');
          this.router.navigate(['/admin/category']);
        },
        error: (err) => {
          this.isLoading=false;
          console.error(err);
        },
      });
  }
}
