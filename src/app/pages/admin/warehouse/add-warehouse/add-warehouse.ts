import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Warehouse } from '../../../../core/services/admin/warehouse/warehouse';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-warehouse',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-warehouse.html',
  styleUrl: './add-warehouse.css',
})
export class AddWarehouse {

   warehouseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: Warehouse,
    private router: Router
  ) {
    this.warehouseForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.warehouseForm.invalid) {
      return;
    }

    this.adminService.addWarehouse(this.warehouseForm.value).subscribe({
      next: () => {
        alert('Warehouse added successfully');
        this.router.navigate(['/admin/warehouse']);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

}
