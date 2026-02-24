import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Warehouse } from '../../../../core/services/admin/warehouse/warehouse';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
type warehouseFormFields = 'name' | 'address' | 'city' | 'state' | 'pincode';
@Component({
  selector: 'app-edit-warehouse',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Spinner],
  templateUrl: './edit-warehouse.html',
  styleUrl: './edit-warehouse.css',
})
export class EditWarehouse {
  warehouseForm!: FormGroup;
  warehouseId!: number;
 formErrors: Record<warehouseFormFields, string> = {
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  };
  validationMessages: Record<warehouseFormFields, any> = {
    name: {
      required: 'Enter name',
      email: 'Enter valid name',
    },
    address: {
      required: 'Enter address',
      
    },
    city:{
        required: 'Enter City',
        pattern: 'Enter valid city name'
    },
    state:{
        required: 'Enter state',
        pattern: 'Enter valid state name'
    },
    pincode:{
        required: 'Enter pincode',
        pattern: 'Enter valid pincode'
    }
  };
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: Warehouse,
    private cdr: ChangeDetectorRef,
  ) {
     this.warehouseForm = this.fb.group({
      name: ['', [Validators.required,   Validators.pattern(/^[A-Za-z\s]+$/)]],
      address: ['', Validators.required,],
      city: ['', Validators.required, ],
      state: ['', [Validators.required,   Validators.pattern(/^[A-Za-z\s]+$/)]],
      pincode: ['', [Validators.required,   Validators.pattern(/^\d{6}$/)]],
    });
        this.warehouseForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }
  isLoading:boolean=false;
  ngOnInit(): void {
    this.warehouseId = Number(this.route.snapshot.paramMap.get('id'));

    

    this.loadWarehouse();
  }
   updateFormErrors(): void {
    (Object.keys(this.formErrors) as warehouseFormFields[]).forEach((field) => {
      const control = this.warehouseForm.get(field);
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

  loadWarehouse() {
  this.isLoading = true;

  this.adminService.getWarehouseById(this.warehouseId).subscribe({

    next: (res: any) => {
      this.warehouseForm.patchValue({
        name: res?.data?.name || '',
        address: res?.data?.address || '',
        city: res?.data?.city || '',
        state: res?.data?.state || '',
        pincode: res?.data?.pincode || '',
      });

      this.isLoading = false;
    },

    error: (err) => {
      this.isLoading = false;
      console.error(err);

      Swal.fire({
        title: err.error?.message || 'Failed to load warehouse details',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444'
      });
    },

  });
}

  onSubmit() {
  this.isLoading = true;

  if (this.warehouseForm.invalid) {
    this.isLoading = false;
    this.warehouseForm.markAllAsTouched();
    this.updateFormErrors();

    return;
  }

  this.adminService.updateWarehouse(this.warehouseId, this.warehouseForm.value)
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({

      next: () => {

        Swal.fire({
          title: 'Warehouse Updated Successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e'
        }).then(() => {
          this.router.navigate(['/admin/warehouse']);
        });

      },

      error: (err) => {
        console.error(err);

        Swal.fire({
          title: err.error?.message || 'Failed to update warehouse',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        });
      },

    });
}
}
