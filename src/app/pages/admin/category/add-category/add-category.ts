import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Admin } from '../../../../core/services/admin/admin';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-category',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css',
})
export class AddCategory {

  categoryForm: FormGroup;

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
    if (this.categoryForm.invalid) {
      return;
    }

    this.adminService.addCategory(this.categoryForm.value).subscribe({
      next: (res) => {
        alert('Category added successfully');
        this.categoryForm.reset();
        this.router.navigate(['/admin/category/'])
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

}
