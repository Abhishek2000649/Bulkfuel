import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Admin } from '../../../../core/services/admin/admin';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-category',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './edit-category.html',
  styleUrl: './edit-category.css',
})
export class EditCategory {

    categoryForm!: FormGroup;
  categoryId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: Admin
  ) {}

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));

    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.loadCategory();
  }

  loadCategory() {
    this.adminService.getCategoryById(this.categoryId).subscribe({
      next: (res) => {
        this.categoryForm.patchValue({
          name: res.name,
        });
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }

    this.adminService.updateCategory(this.categoryId, this.categoryForm.value)
      .subscribe({
        next: () => {
          alert('Category updated successfully');
          this.router.navigate(['/admin/category']);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
