import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Warehouse } from '../../../../core/services/admin/warehouse/warehouse';
import { Router, RouterLink } from '@angular/router';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-add-warehouse',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Spinner],
  templateUrl: './add-warehouse.html',
  styleUrl: './add-warehouse.css',
})
export class AddWarehouse {
    isLoading:boolean=false;
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
    this.isLoading=true;
    if (this.warehouseForm.invalid) {
      this.isLoading=false;
      return;
    }

    this.adminService.addWarehouse(this.warehouseForm.value).subscribe({
      next: () => {
        this.isLoading=false;
        alert('Warehouse added successfully');
        this.router.navigate(['/admin/warehouse']);
      },
      error: (err) => {
        this.isLoading=false;
        console.error(err);
      },
    });
  }

}
