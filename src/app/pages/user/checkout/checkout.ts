import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/user/cart/cart-service';
import { CheckoutService } from '../../../core/services/user/checkoutService/checkout-service';
import { Spinner } from '../../../shared/spinner/spinner';
type checkoutFormFields =  'address' | 'city' | 'state' | 'pincode';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Spinner],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {

  cartItems: any[] = [];
  cartIds: number[] = [];
  totalAmount = 0;
  user: any = null;
  isLoading:boolean=false;
  checkoutForm!: FormGroup;
formErrors: Record<checkoutFormFields, string> = {
    
    address: '',
    city: '',
    state: '',
    pincode: '',
  };
  validationMessages: Record<checkoutFormFields, any> = {
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
  payment_method: ['COD', Validators.required],
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
    this.isLoading=true;
    this.cartIds = this.checkoutService.getCartIds();

    if (this.cartIds.length === 0) {
      this.isLoading=false;
      this.router.navigate(['/user/cart']);
      return;
    }

    this.cartService.checkout(this.cartIds).subscribe({
      next: (res: any) => {
        this.cartItems = res.cartItems;
        this.totalAmount = res.totalAmount;
        this.user = res.user;

        if (this.user?.address) {
          this.checkoutForm.patchValue({
  address: this.user.address.address,
  city: this.user.address.city,
  state: this.user.address.state,
  pincode: this.user.address.pincode,
});

          this.isLoading=false;
        }
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading=false;
        this.router.navigate(['/user/cart']);
      },
    });
  }

  placeOrder(): void {
    this.isLoading=true;
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
        this.checkoutService.clear();
        this.isLoading=false;
        alert('Order placed successfully');
        this.router.navigate(['/user/orders']);
      },
    });
  }

  goBackToCart(): void {
    this.router.navigate(['/user/cart']);
  }
}
