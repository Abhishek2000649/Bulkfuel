import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Warehouse } from '../../../../core/services/admin/warehouse/warehouse';
import { Router, RouterLink } from '@angular/router';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
type warehouseFormFields = 'name' | 'address' | 'city' | 'state' | 'pincode';
@Component({
  selector: 'app-add-warehouse',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Spinner],
  templateUrl: './add-warehouse.html',
  styleUrl: './add-warehouse.css',
})
export class AddWarehouse {
    isLoading:boolean=false;
   warehouseForm: FormGroup;

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
    private adminService: Warehouse,
    private router: Router,
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

  onSubmit() {
    this.isLoading=true;
    if (this.warehouseForm.invalid) {
       this.warehouseForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading=false;
      return;
    }

    this.adminService.addWarehouse(this.warehouseForm.value).pipe(
      finalize(()=>{
        this.isLoading=false;
        this.cdr.detectChanges();
      })
    ).subscribe({
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
