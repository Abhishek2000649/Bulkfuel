import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/user/cart/cart-service';
import { CheckoutService } from '../../../core/services/user/checkoutService/checkout-service';
import { Spinner } from '../../../shared/spinner/spinner';
import Swal from 'sweetalert2';
import { ProfileService } from '../../../core/services/Auth/profile/profile-service';
import { Auth } from '../../../core/services/Auth/authservice/auth';
type checkoutFormFields = 'address_id' | 'payment_method';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Spinner],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  allowedPayment: string[] = [];
  cartItems: any[] = [];
  cartIds: number[] = [];
  addresses: any[] = [];
  totalAmount = 0;
  user: any = null;
  isLoading: boolean = false;
  checkoutForm!: FormGroup;
  formErrors: Record<checkoutFormFields, string> = {

    address_id: '',
    payment_method: '',
  };
  validationMessages: Record<checkoutFormFields, any> = {
    address_id: {
      required: 'Select any address'
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
    private profileService: ProfileService,
    private auth: Auth,

    private cdr: ChangeDetectorRef
  ) {
    this.checkoutForm = this.fb.group({
      address_id: [null, Validators.required],
      payment_method: ['', Validators.required],
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
    this.loadAddresses();

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
  loadAddresses() {
    this.profileService.getAddresses().subscribe((res: any) => {

      this.addresses = res.data;
      console.log("address:", this.addresses);
      

      const current = this.addresses.find(a => a.is_current == 1);
      if (current) {
        this.checkoutForm.patchValue({
          address_id: current.id
        });
      }

      this.isLoading = false;

      this.cdr.detectChanges();
    });
  }

  placeOrder(): void {
    this.isLoading = true;
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
