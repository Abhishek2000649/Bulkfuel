import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Spinner } from '../../../shared/spinner/spinner';
import { ProfileService } from '../../../core/services/Auth/profile/profile-service';
import { finalize } from 'rxjs';
import { Map } from '../../../shared/map/map';
import { Location } from '../../../core/services/location/location';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Location as NgLocation } from '@angular/common';

type addressFormFields =
  | 'address'
  | 'city'
  | 'state'
  | 'pincode'
  | 'phone_number'
  | 'alternate_phone'
  | 'house_no'
  | 'building_name'
  | 'street'
  | 'area'
  | 'landmark';
@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Spinner, Map],
  templateUrl: './address.html',
  styleUrl: './address.css',
})
export class Address implements OnInit {
  isLoading: boolean = false;
  user: any = null;
  addresses: any[] = [];
  selectedAddressId: number | null = null;
  addressForm!: FormGroup;
  @ViewChild(Map) mapComponent!: Map;
  formErrors: Record<addressFormFields, string> = {
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone_number: '',
    alternate_phone: '',
    house_no: '',
    building_name: '',
    street: '',
    area: '',
    landmark: '',
  };


  currentAddress: string = '';

  validationMessages: Record<addressFormFields, any> = {
    phone_number: {
      required: 'Enter phone number',
      pattern: 'Enter valid 10-digit number'
    },
    alternate_phone: {
      pattern: 'Enter valid alternate number'
    },
    address: {
      required: 'Enter address',
    },
    house_no: {
      required: 'Enter house/flat number',
    },
    area: {
      required: 'Enter area/locality',
    },
    city: {
      required: 'Enter city',
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
    building_name: {},
    street: {},
    landmark: {},
  };

  getLocationFromMap() {
    this.mapComponent.getCurrentLocation();
    window.scrollBy({
      top: 500,
      behavior: 'smooth'
    });
  }

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService, // reuse API
    private router: Router,
    private locationService: Location,
    private cdr: ChangeDetectorRef,
    private auth: Auth,
    private ngLocation: NgLocation
  ) {
    // SAME FORM VALIDATION
    this.addressForm = this.fb.group({
      phone_number: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      alternate_phone: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],

      address: ['', Validators.required],

      house_no: ['', Validators.required],
      building_name: [''],
      street: [''],
      area: ['', Validators.required],
      landmark: [''],

      city: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      state: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],

      latitude: [''],
      longitude: [''],

      delivery_instructions: ['']
    });

    this.addressForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
    this.loadProfile();
    this.listenLocation();
  }

  goBack(): void {
    this.ngLocation.back();
  }


  loadAddresses() {
    this.profileService.getAddresses().subscribe((res: any) => {

      this.addresses = res.data;

      const current = this.addresses.find(a => a.is_current == 1);
      if (current) {
        this.selectedAddressId = current.id;
        this.locationService.currentAddress$.next(current);
      }

      this.isLoading = false;

      this.cdr.detectChanges();
    });
  }


  loadProfile() {
    this.profileService.getProfile().subscribe((res: any) => {
      this.user = res?.user || {};

      // if (this.user?.address) {
      //   this.addressForm.patchValue(this.user.address);
      // }
    });
  }

  listenLocation() {
    this.locationService.location$.subscribe((data: any) => {
      if (!data) return;
      const newAddress = data.full_address || '';
      this.addressForm.patchValue({
        address: data.full_address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        latitude: data.latitude || '',
        longitude: data.longitude || ''
      });
      this.currentAddress = newAddress;

      this.cdr.detectChanges();

    });
  }


  setCurrentAddress() {

    if (!this.selectedAddressId) return;

    this.isLoading = true;

    this.profileService.setCurrentAddress(this.selectedAddressId)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.loadAddresses();
          const current = this.addresses.find(a => a.id === this.selectedAddressId);

          if (current) {
            this.auth.me().subscribe();
          }

          // ✅ IMPORTANT: force UI update
          setTimeout(() => {
            this.cdr.detectChanges();
          });

        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
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
    if (this.addresses.length >= 5) {
      Swal.fire({
        title: 'Limit Reached',
        text: 'You can only add up to 5 addresses',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff'
      });
      return;
    }

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
        this.cdr.detectChanges();
        Swal.fire({
          title: res.message || 'Address updated successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e'
        }).then(() => {

          this.loadAddresses();
          this.addressForm.reset();
          this.ngLocation.back();
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        this.cdr.detectChanges();

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

  deleteAddress(id: number): void {

    Swal.fire({
      title: 'Are you sure?',
      text: 'This address will be deleted permanently',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then((result) => {

      if (result.isConfirmed) {

        this.profileService.deleteAddress(id).subscribe({
          next: (res: any) => {

            // ✅ UI se remove karo
            this.addresses = this.addresses.filter(a => a.id !== id);

            Swal.fire({
              title: res.message || 'Deleted successfully',
              icon: 'success',
              confirmButtonColor: '#22c55e'
            });
            this.auth.me().subscribe();

          },
          error: () => {
            Swal.fire({
              title: 'Failed to delete address',
              icon: 'error'
            });
          }
        });

      }

    });
  }
}
