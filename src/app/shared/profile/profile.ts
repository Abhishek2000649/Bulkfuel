import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfileService } from '../../core/services/Auth/profile/profile-service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Spinner } from '../spinner/spinner';
import { finalize } from 'rxjs';
import { pattern, required } from '@angular/forms/signals';
type ProfileBasicFormFields =  'name' | 'email' ;
type ProfileAddressFormFields =  'address' | 'city' | 'state' | 'pincode' ;
type ProfilePasswordFormFields = 'current_password' | 'password' | 'password_confirmation';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Spinner],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  basicForm!: FormGroup;
addressForm!: FormGroup;
passwordForm!: FormGroup;
formBasicErrors: Record<ProfileBasicFormFields, string> = {
    name: '',
    email: '',
  };
  validationBasicMessages: Record<ProfileBasicFormFields, any> = {
    
    name: {
      required: 'Enter name',
      pattern: 'Enter valid name',
    },
    email: {
      required: 'Enter email',
      email: 'Enter a valid email address',
    },
    
  };

  formAddressErrors: Record<ProfileAddressFormFields, string> = {
    address: '',
    city: '',
    state: '',
    pincode: '',
  };
  validationAddressMessages: Record<ProfileAddressFormFields, any> = {
    
    address: {
      required: 'Enter Address',
    },
    city: {
      required: 'Enter city',
      
    },
    state: {
      required: 'Enter state',
      pattern: 'Enter valid state'
    },
    pincode: {
      required: 'Enter pincode',
      pattern: 'Enter valid pincode'
    }
    
  };
  formPasswordErrors: Record<ProfilePasswordFormFields, string> = {
    current_password: '',
    password: '',
    password_confirmation: '',
  };
  validationPasswordMessages: Record<ProfilePasswordFormFields, any> = {
    
    current_password: {
      required: 'Enter current password',
      minlength: 'Password must be at least 6 characters',
    },
    password: {
required: 'Enter new  password',
      minlength: 'Password must be at least 6 characters',
    },
    password_confirmation:{
     required: 'Enter confirm password',
      minlength: 'Password must be at least 6 characters',
    }
    
  };
  user: any = {};
  address: any = {};
  isLoading:boolean=false;
  // visibility
  showBasic = true;     
  showAddress = false;
  showPassword = false;

  passwordData = {
    current_password: '',
    password: '',
    password_confirmation: ''
  };

  message = '';
  error = '';

  constructor(
      private fb: FormBuilder,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {
    this.basicForm = this.fb.group({
  name: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
  email: ['', [Validators.required, Validators.email]],
});

this.addressForm = this.fb.group({
  address: ['', Validators.required],
  city: ['', Validators.required],
  state: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
  pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
});

this.passwordForm = this.fb.group({
  current_password: ['', [Validators.required, Validators.minLength(6)]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  password_confirmation: ['', [Validators.required,Validators.minLength(6) ]],
});

 this.basicForm.valueChanges.subscribe(() => {
      this.updateBasicFormErrors();
    });
    this.addressForm.valueChanges.subscribe(() => {
      this.updateAddressFormErrors();
    });
    this.passwordForm.valueChanges.subscribe(() => {
      this.updatePasswordFormErrors();
    });

  }

   updateBasicFormErrors(): void {
    (Object.keys(this.formBasicErrors) as ProfileBasicFormFields[]).forEach((field) => {
      const control = this.basicForm.get(field);
      this.formBasicErrors[field] = '';

      if (control && control.invalid && (control.dirty || control.touched)) {
        const messages = this.validationBasicMessages[field];

        if (control.errors) {
          for (const errorKey of Object.keys(control.errors)) {
            this.formBasicErrors[field] = messages[errorKey];
            break; 
          }
        }
      }
    });
  }
  updateAddressFormErrors(): void {
    (Object.keys(this.formAddressErrors) as ProfileAddressFormFields[]).forEach((field) => {
      const control = this.addressForm.get(field);
      this.formAddressErrors[field] = '';

      if (control && control.invalid && (control.dirty || control.touched)) {
        const messages = this.validationAddressMessages[field];

        if (control.errors) {
          for (const errorKey of Object.keys(control.errors)) {
            this.formAddressErrors[field] = messages[errorKey];
            break; 
          }
        }
      }
    });
  }
  updatePasswordFormErrors(): void {
    (Object.keys(this.formPasswordErrors) as ProfilePasswordFormFields[]).forEach((field) => {
      const control = this.passwordForm.get(field);
      this.formPasswordErrors[field] = '';

      if (control && control.invalid && (control.dirty || control.touched)) {
        const messages = this.validationPasswordMessages[field];

        if (control.errors) {
          for (const errorKey of Object.keys(control.errors)) {
            this.formPasswordErrors[field] = messages[errorKey];
            break; 
          }
        }
      }
    });
  }


  ngOnInit(): void {
    this.loadProfile();
    this.openBasic(); // ✅ ensure basic tab opens
  }

  /* =========================
     LOAD PROFILE
  ========================= */
  loadProfile() {
    this.isLoading =true;
    this.profileService.getProfile().subscribe({
      next: (res) => {
       this.basicForm.patchValue({
  name: res.user.name,
  email: res.user.email,
});

if (res.user.address) {
  this.addressForm.patchValue({
    address: res.user.address.address,
    city: res.user.address.city,
    state: res.user.address.state,
    pincode: res.user.address.pincode,
  });
}

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load profile';
      }
    });
  }

  /* =========================
     TAB CONTROLS
  ========================= */
  openBasic() {
    this.reset();
    this.showBasic = true;
  }

  openAddress() {
    this.reset();
    this.showAddress = true;
  }

  openPassword() {
    this.reset();
    this.showPassword = true;
  }

  reset() {
    this.showBasic = false;
    this.showAddress = false;
    this.showPassword = false;
    this.message = '';
    this.error = '';
  }

  /* =========================
     UPDATE BASIC
  ========================= */
  updateBasic() {
  if (this.basicForm.invalid) {
    this.basicForm.markAllAsTouched();
    this.updateBasicFormErrors();
    return;
  }

  this.isLoading = true;

  this.profileService.updateBasic(this.basicForm.value).pipe(
    finalize(()=>{
      this.isLoading=false;
      this.cdr.detectChanges();
    })
  )
    .subscribe({
      next: (res) => {
        this.message = res.message;
        
      },
      error: (err) => {
        
        this.error = err.error?.message || 'Update failed';
      }
    });
}


  /* =========================
     UPDATE ADDRESS
  ========================= */
  updateAddress() {
  if (this.addressForm.invalid) {
    this.addressForm.markAllAsTouched();
    this.updateAddressFormErrors();
    return;
  }

  this.isLoading = true;

  this.profileService.updateAddress(this.addressForm.value).pipe(
    finalize(()=>{
      this.isLoading=false;
      this.cdr.detectChanges();
    })
  )
    .subscribe({
      next: (res) => {
        this.message = res.message;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Address update failed';
      }
    });
}


  /* =========================
     UPDATE PASSWORD
  ========================= */
  updatePassword() {
  if (this.passwordForm.invalid) {
    this.passwordForm.markAllAsTouched();
    this.updatePasswordFormErrors();
    return;
  }

  this.isLoading = true;

  this.profileService.updatePassword(this.passwordForm.value)
  .pipe(
    finalize(()=>{
      this.isLoading=false;
      this.cdr.detectChanges();
    })
  )
    .subscribe({
      next: (res) => {
        this.message = res.message;
        this.passwordForm.reset();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.error =
          err.error?.errors?.current_password?.[0] ||
          'Password update failed';
      }
    });
}

}
