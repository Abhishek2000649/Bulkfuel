import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/user/cart/cart-service';
import { CheckoutService } from '../../../core/services/user/checkoutService/checkout-service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {

  cartItems: any[] = [];
  cartIds: number[] = [];
  totalAmount = 0;
  user: any = null;

  form = {
    address: '',
    city: '',
    state: '',
    pincode: '',
    payment_method: 'COD',
  };

  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartIds = this.checkoutService.getCartIds();

    if (this.cartIds.length === 0) {
      this.router.navigate(['/user/cart']);
      return;
    }

    this.cartService.checkout(this.cartIds).subscribe({
      next: (res: any) => {
        this.cartItems = res.cartItems;
        this.totalAmount = res.totalAmount;
        this.user = res.user;

        if (this.user?.address) {
          this.form.address = this.user.address.address;
          this.form.city = this.user.address.city;
          this.form.state = this.user.address.state;
          this.form.pincode = this.user.address.pincode;
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate(['/user/cart']);
      },
    });
  }

  placeOrder(): void {
    const payload = {
      ...this.form,
      cart_ids: this.cartIds,
    };

    this.checkoutService.placeOrder(payload).subscribe({
      next: () => {
        alert('Order placed successfully');
        this.checkoutService.clear();
        this.router.navigate(['/user/orders']);
      },
    });
  }

  goBackToCart(): void {
    this.router.navigate(['/user/cart']);
  }
}
