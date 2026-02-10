import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Admin } from '../../../../core/services/admin/admin';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-add-category',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, Spinner],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css',
})
export class AddCategory {

  categoryForm: FormGroup;
  isLoading:boolean=false;
  constructor(
    private fb: FormBuilder,
    private adminService: Admin,
    private router:Router,
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  onSubmit() {
    this.isLoading=true;
    if (this.categoryForm.invalid) {
      this.isLoading=false;
      return;
    }

    this.adminService.addCategory(this.categoryForm.value).subscribe({
      next: (res) => {
        this.isLoading=false;
        alert('Category added successfully');
        this.categoryForm.reset();
        this.router.navigate(['/admin/category/'])
      },
      error: (err) => {
        this.isLoading=false;
        console.error(err);
      },
    });
  }

}
