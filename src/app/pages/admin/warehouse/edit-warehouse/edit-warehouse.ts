import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Warehouse } from '../../../../core/services/admin/warehouse/warehouse';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-edit-warehouse',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Spinner],
  templateUrl: './edit-warehouse.html',
  styleUrl: './edit-warehouse.css',
})
export class EditWarehouse {


    warehouseForm!: FormGroup;
  warehouseId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: Warehouse
  ) {}
  isLoading:boolean=false;
  ngOnInit(): void {
    this.warehouseId = Number(this.route.snapshot.paramMap.get('id'));

    this.warehouseForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', Validators.required],
    });

    this.loadWarehouse();
  }

  loadWarehouse() {
    this.isLoading=true;
    this.adminService.getWarehouseById(this.warehouseId).subscribe({
      next: (res) => {
        this.warehouseForm.patchValue({
          name: res.name,
          address: res.address,
          city: res.city,
          state: res.state,
          pincode: res.pincode,
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
    if (this.warehouseForm.invalid) {
      this.isLoading=false;
      return;
    }

    this.adminService.updateWarehouse(this.warehouseId, this.warehouseForm.value)
      .subscribe({
        next: () => {
          this.isLoading=false;
          alert('Warehouse updated successfully');
          this.router.navigate(['/admin/warehouse']);
        },
        error: (err) => {
          this.isLoading=false;
          console.error(err);
        },
      });
  }
}
