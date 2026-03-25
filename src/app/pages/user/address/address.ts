import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Spinner } from '../../../shared/spinner/spinner';
import { ProfileService } from '../../../core/services/Auth/profile/profile-service';
import { finalize } from 'rxjs';
type addressFormFields = 'address' | 'city' | 'state' | 'pincode';
@Component({
  selector: 'app-address',
   standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Spinner],
  templateUrl: './address.html',
  styleUrl: './address.css',
})
export class Address implements OnInit{
  isLoading: boolean = false;
  user: any = null;
  addressForm!: FormGroup;

  formErrors: Record<addressFormFields, string> = {
    address: '',
    city: '',
    state: '',
    pincode: '',

  };

  validationMessages: Record<addressFormFields, any> = {
    address: {
      required: 'Enter address',
    },
    city: {
      required: 'Enter City',
      pattern: 'Enter valid city name'
    },
    state: {
      required: 'Enter state',
      pattern: 'Enter valid state name'
    },
    pincode: {
      required: 'Enter pincode',
      pattern: 'Enter valid pincode'
    },

  };

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService, // reuse API
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // SAME FORM VALIDATION
    this.addressForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      state: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],

    });

    this.addressForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

 ngOnInit(): void {
  this.isLoading = true;

  this.profileService.getProfile().pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
    next: (res: any) => {

      this.user = res?.user || {};

      if (this.user?.address) {
        this.addressForm.patchValue({
          address: this.user.address.address || '',
          city: this.user.address.city || '',
          state: this.user.address.state || '',
          pincode: this.user.address.pincode || '',
        });
      }

      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: () => {
      this.isLoading = false;

      Swal.fire({
        title: 'Failed to load address',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  });
}

  // ✅ SAME VALIDATION FUNCTION
  updateFormErrors(): void {
    (Object.keys(this.formErrors) as addressFormFields[]).forEach((field) => {
      const control = this.addressForm.get(field);
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

  // ✅ UPDATE ADDRESS FUNCTION
  updateAddress(): void {

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.updateFormErrors();
      return;
    }

    this.isLoading = true;

    this.profileService.updateAddress(this.addressForm.value).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        Swal.fire({
                    title: res.message || 'Address updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d4af37',
                    background: 'linear-gradient(135deg, #3b0000, #1a0000)',
                    color: '#ffffff',
                    iconColor: '#22c55e'
                  }).then(() => {
          this.router.navigate(['/user']);
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        
        const message =
          err?.error?.message ||
          'Failed to update address';

        Swal.fire({
                  title: message,
                  icon: 'error',
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#d4af37',
                  background: 'linear-gradient(135deg, #3b0000, #1a0000)',
                  color: '#ffffff',
                  iconColor: '#ef4444'
                })
      }
    });
  }
}
