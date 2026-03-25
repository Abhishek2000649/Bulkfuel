import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/user/cart/cart-service';
import { CheckoutService } from '../../../core/services/user/checkoutService/checkout-service';
import { Spinner } from '../../../shared/spinner/spinner';
import Swal from 'sweetalert2';
type checkoutFormFields = 'address' | 'city' | 'state' | 'pincode' | 'phone' | 'payment_method';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Spinner],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  allowedPayment: string[] = [];
  cartItems: any[] = [];
  cartIds: number[] = [];
  totalAmount = 0;
  user: any = null;
  isLoading: boolean = false;
  checkoutForm!: FormGroup;
  formErrors: Record<checkoutFormFields, string> = {

    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    payment_method: '',
  };
  validationMessages: Record<checkoutFormFields, any> = {
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
    phone: {
      required: 'Enter phone number',
      pattern: 'Enter valid 10 digit phone number'
    },
    payment_method: {
      required: 'Select payment method'
    }
  };
  constructor(
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.checkoutForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      state: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      payment_method: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
    this.checkoutForm.valueChanges.subscribe(() => {
      this.updateFormErrors();
    });

  }

  updateFormErrors(): void {
    (Object.keys(this.formErrors) as checkoutFormFields[]).forEach((field) => {
      const control = this.checkoutForm.get(field);
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

  ngOnInit(): void {
    this.isLoading = true;
    this.cartIds = this.checkoutService.getCartIds();

    if (this.cartIds.length === 0) {
      this.isLoading = false;
      this.router.navigate(['/user/cart']);
      return;
    }

    this.cartService.checkout(this.cartIds).subscribe({
      next: (res: any) => {
        this.cartItems = res.cartItems;
        this.totalAmount = res.totalAmount;
        this.allowedPayment = res.allowedPayment;
        this.user = res.user;
        if (this.allowedPayment.length > 0) {
          this.checkoutForm.patchValue({
            payment_method: this.allowedPayment[0]
          });
        }
        if (this.user?.address) {
          this.checkoutForm.patchValue({
            address: this.user.address?.address || '',
            city: this.user.address?.city || '',
            state: this.user.address?.state || '',
            pincode: this.user.address?.pincode || '',
            phone: this.user?.phone || '',
          });
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.isLoading = false;

        const message =
          err?.error?.message ||
          err?.message ||
          'Failed to load checkout data';

        Swal.fire({
          title: message,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        }).then(() => {
          this.router.navigate(['/user/cart']);
        });

        console.error(err);
      },
    });
  }

  placeOrder(): void {
    this.isLoading = true;

    // 1️⃣ Form Invalid
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.updateFormErrors();
      this.isLoading = false;

      return;
    }

    const payload = {
      ...this.checkoutForm.value,
      cart_ids: this.cartIds,
    };

    this.checkoutService.placeOrder(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.checkoutService.clear();


        Swal.fire({
          title: 'Order placed successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#22c55e'
        }).then(() => {
          this.router.navigate(['/user/orders']);
        });
      },


      error: (err) => {
        this.isLoading = false;

        const message =
          err?.error?.message ||
          err?.error?.errors?.cart_ids?.[0] ||
          err?.message ||
          'Failed to place order';

        Swal.fire({
          title: message,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        });

        console.error(err);
      }
    });
  }

  goBackToCart(): void {
    this.router.navigate(['/user/cart']);
  }
}
