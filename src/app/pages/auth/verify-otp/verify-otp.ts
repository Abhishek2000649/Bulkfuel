import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../shared/spinner/spinner';
import { finalize, switchMap } from 'rxjs';

type VerifyFormFields = 'otp' | 'password' | 'confirmPassword';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, Spinner, CommonModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
})
export class VerifyOtp {

  verifyForm!: FormGroup;
  email: string = '';
  name: string = '';
  type: string = '';
  isLoading = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  resendCooldown = 30;
  canResend = false;
  // 🔥 OTP ARRAY
  otpArray: string[] = ['', '', '', '', '', ''];

  // 🔥 ERROR STATE
  formErrors: Record<VerifyFormFields, string> = {
    otp: '',
    password: '',
    confirmPassword: '',
  };

  validationMessages: Record<VerifyFormFields, any> = {
    otp: {
      required: 'Enter OTP',
    },
    password: {
      required: 'Enter password',
      minlength: 'Password must be at least 6 characters',
    },
    confirmPassword: {
      required: 'Enter confirm password',
    }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {

    this.verifyForm = this.fb.group({
      otp: [''], // handled manually
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    this.verifyForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });
  }

  ngOnInit() {
    const data = this.auth.getData();
    if (!data || !data.type) {
  this.router.navigate(['/login']);
  return;
}

    this.email = data.email;
    this.name = data.name;
    this.type = data?.type;
    this.startResendTimer();
  }

 resendOtp() {

  // ✅ Basic validation
  if (!this.email) {
    return;
  }

  this.isLoading = true;

  let apiCall;

  // 🔥 Decide API based on flow
  if (this.type === 'register') {

    apiCall = this.auth.register({
      email: this.email,
      name: this.name
    });

  } 
  else if (this.type === 'forgot') {

    apiCall = this.auth.forgotPassword({
      email: this.email
    });

  } 
  else {
    this.isLoading = false;
    this.router.navigate(['/login']);
    return;
  }

  apiCall
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({

      next: (res: any) => {

        if (res.status) {

          // 🔄 Reset OTP fields
          this.otpArray = ['', '', '', '', '', ''];
          this.verifyForm.patchValue({ otp: '' });

          // 🎯 Focus first input
          setTimeout(() => {
            document.getElementById('otp-0')?.focus();
          }, 100);

          // 🔔 Success message
          Swal.fire({
            title: res.message || "OTP Resent Successfully",
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#22c55e',
          });

          // 🔥 Restart timer
          this.startResendTimer();
        }

      },

      error: (err: any) => {

        Swal.fire({
          title: err?.error?.message || "Failed to resend OTP",
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444',
        });

        console.error(err);
      }

    });

}
  startResendTimer() {
    this.canResend = false;
    this.resendCooldown = 30;

    const interval = setInterval(() => {
      this.resendCooldown--;
      this.cdr.detectChanges();

      if (this.resendCooldown <= 0) {
        this.canResend = true;
        clearInterval(interval);
        this.cdr.detectChanges();
      }
    }, 1000);
  }
  // 🔥 HANDLE OTP INPUT
  onOtpInput(event: any, index: number) {
    const value = event.target.value;

    if (!/^[0-9]$/.test(value)) {
      event.target.value = '';
      return;
    }

    this.otpArray[index] = value;

    // move forward
    if (index < 5) {
      const next = document.getElementById('otp-' + (index + 1));
      next?.focus();
    }

    this.updateOtpValue();
  }

  // 🔥 BACKSPACE HANDLING
  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      if (!this.otpArray[index] && index > 0) {
        const prev = document.getElementById('otp-' + (index - 1));
        prev?.focus();
      }

      this.otpArray[index] = '';
      this.updateOtpValue();
    }
  }

  // 🔥 COMBINE OTP
  updateOtpValue() {
    const otp = this.otpArray.join('');
    this.verifyForm.patchValue({ otp });
  }

  // 🔥 FORM ERROR HANDLING
  updateFormErrors(): void {

    (Object.keys(this.formErrors) as VerifyFormFields[]).forEach((field) => {

      const control = this.verifyForm.get(field);
      this.formErrors[field] = '';

      if (control && control.invalid && (control.dirty || control.touched)) {

        const message = this.validationMessages[field];

        if (control.errors) {
          for (const errorKey of Object.keys(control.errors)) {
            this.formErrors[field] = message[errorKey];
            break;
          }
        }
      }
    });

    // 🔥 PASSWORD MATCH CHECK
    if (
      this.verifyForm.get('confirmPassword')?.touched &&
      this.verifyForm.value.password !== this.verifyForm.value.confirmPassword
    ) {
      this.formErrors.confirmPassword = 'Passwords do not match';
    }
  }

  // 🔥 SUBMIT
submit() {

  this.isLoading = true;

  const otp = this.otpArray.join('');

  // OTP validation
  if (otp.length !== 6) {
    this.formErrors.otp = 'Enter complete OTP';
    this.isLoading = false;
    return;
  }

  // Form validation
  if (this.verifyForm.invalid) {
    this.verifyForm.markAllAsTouched();
    this.updateFormErrors();
    this.isLoading = false;
    return;
  }

  // Password match
  if (this.verifyForm.value.password !== this.verifyForm.value.confirmPassword) {
    Swal.fire("Passwords do not match");
    this.isLoading = false;
    return;
  }

  const payload: any = {
    email: this.email,
    otp: otp,
    password: this.verifyForm.value.password
  };

  // 🔥 ADD NAME ONLY FOR REGISTER
  if (this.type === 'register') {
    payload.name = this.name;
  }

  // 🔥 API CALL BASED ON TYPE
  let apiCall;

  if (this.type === 'register') {
    apiCall = this.auth.verifyOtp(payload);
  } 
  else if (this.type === 'forgot') {
    apiCall = this.auth.resetPassword(payload);
  } 
  else {
    this.router.navigate(['/login']);
    this.isLoading = false;
    return;
  }

  apiCall.pipe(
    finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })
  ).subscribe({

    next: (res: any) => {

      // ✅ REGISTER FLOW
      if (this.type === 'register') {

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        this.auth.setUser(res.data.user);

        Swal.fire({
          title: res.message || "Account created",
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e',
        });

        this.auth.me().subscribe((res: any) => {
          const user = res.user;

          switch (user.role) {
            case 'ADMIN':
              this.router.navigate(['/admin/product']);
              break;
            case 'delivery_agent':
              this.router.navigate(['/delivery/available']);
              break;
            case 'USER':
              this.router.navigate(['/user']);
              break;
            default:
              this.router.navigate(['/']);
          }
        });

      }

      // ✅ FORGOT PASSWORD FLOW
      else if (this.type === 'forgot') {

        Swal.fire({
          title: res.message || "Password reset successfully",
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e',
        });

        this.auth.clearData();

        this.router.navigate(['/login']);
      }

    },

    error: (err:any) => {

      Swal.fire({
        title: err?.error?.message || "Something went wrong",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444',
      });

      console.error(err);
    }

  });

}
}