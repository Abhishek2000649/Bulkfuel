import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Warehouse } from '../../../../core/services/admin/warehouse/warehouse';
import { Spinner } from '../../../../shared/spinner/spinner';
import { finalize } from 'rxjs';
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
       this.warehouseForm.markAllAsTouched();
      this.updateFormErrors();
      return;
    }

    this.adminService.updateWarehouse(this.warehouseId, this.warehouseForm.value).pipe(
          finalize(()=>{
            this.isLoading=false;
            this.cdr.detectChanges();
          }))
      .subscribe({
        next: () => {
          alert('Warehouse updated successfully');
          this.router.navigate(['/admin/warehouse']);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
