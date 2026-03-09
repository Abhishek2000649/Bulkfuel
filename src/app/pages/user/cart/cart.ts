import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { CartService } from '../../../core/services/user/cart/cart-service';
import { CheckoutService } from '../../../core/services/user/checkoutService/checkout-service';
import { Spinner } from '../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {

  cartItems: any[] = [];
  selectedTotal = 0;
  selectAll = false;
  checkoutError = '';
  isLoading = false;
  stockWarnings: Record<number, string> = {};

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  // ================= LOAD CART =================
 loadCart() {
  this.isLoading = true;

  this.cartService.getCart()
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (res: any) => {
        this.cartItems = res.cartItems.map((item: any) => ({
          ...item,
          selected: false
        }));

        this.updateStockWarnings();
        this.calculateTotal();
      },

      error: (err) => {
        const message =
          err?.error?.message ||
          err?.message ||
          'Failed to load cart';

        Swal.fire({
          title: message,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d4af37',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#ef4444'
        });

        console.error('Failed to load cart', err);
      }
    });
}
  // ================= SELECT ALL =================
  toggleSelectAll() {
    this.checkoutError='';
    this.cartItems.forEach(item => item.selected = this.selectAll);
    this.calculateTotal();
  }

  // ================= TOTAL =================
  calculateTotal() {
    this.checkoutError='';
    this.selectedTotal = this.cartItems
      .filter(item => item.selected)
      .reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
  }

  // ================= STOCK WARNINGS =================
  updateStockWarnings() {
    this.checkoutError='';
    this.stockWarnings = {};

    this.cartItems.forEach(item => {
      if (item.quantity > item.product.totalStock) {
        this.stockWarnings[item.product_id] =
          `Only ${item.product.totalStock} items available`;
      }
    });
  }

  // ================= INCREASE =================
 increase(item: any) {
  this.checkoutError = '';

  if (item.quantity >= item.product.totalStock) return;

  this.isLoading = true;

  this.cartService.updateCart(item.product_id, 'increase')
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        item.quantity++;
        this.updateStockWarnings();
        this.calculateTotal();
      },

      error: (err) => {
        const message =
          err?.error?.message ||
          err?.message ||
          'Failed to update cart';

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

  // ================= DECREASE =================
 decrease(item: any) {
  this.isLoading = true;
  this.checkoutError = '';

  this.cartService.updateCart(item.product_id, 'decrease')
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          this.cartItems = this.cartItems.filter(i => i !== item);
        }

        this.updateStockWarnings();
        this.calculateTotal();
      },

      error: (err) => {
        const message =
          err?.error?.message ||
          err?.message ||
          'Failed to update cart';

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

  // ================= REMOVE =================
 remove(item: any) {
  this.isLoading = true;
  this.checkoutError = '';

  this.cartService.removeItem(item.id)
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(i => i !== item);
        this.calculateTotal();
      },

      error: (err) => {
        const message =
          err?.error?.message ||
          err?.message ||
          'Failed to remove item';

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

  // ================= CHECKOUT =================
 checkout() {
  this.checkoutError = '';

  const selectedItems = this.cartItems.filter(i => i.selected);

  // 1️⃣ No Product Selected
  if (selectedItems.length === 0) {
    this.checkoutError = 'Please select at least one product';

    Swal.fire({
      title: this.checkoutError,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d4af37',
      background: 'linear-gradient(135deg, #3b0000, #1a0000)',
      color: '#ffffff',
      iconColor: '#f59e0b'
    });

    return;
  }

  const hasStockIssue = selectedItems.some(
    i => this.stockWarnings[i.product_id]
  );

  // 2️⃣ Stock Issue Found
  if (hasStockIssue) {
    this.checkoutError = 'Fix stock issues before checkout';

    Swal.fire({
      title: this.checkoutError,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d4af37',
      background: 'linear-gradient(135deg, #3b0000, #1a0000)',
      color: '#ffffff',
      iconColor: '#ef4444'
    });

    return;
  }

  const cartIds = selectedItems.map(i => i.id);
  this.checkoutService.setCartIds(cartIds);
  this.router.navigate(['/user/checkout']);
}
}
