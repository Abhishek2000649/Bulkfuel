import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { CartService } from '../../../core/services/user/cart/cart-service';
import { CheckoutService } from '../../../core/services/user/checkoutService/checkout-service';
import { Spinner } from '../../../shared/spinner/spinner';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './cart.html',
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
    this.checkoutError='';
    if (item.quantity >= item.product.totalStock) return;

    this.isLoading = true;

    this.cartService.updateCart(item.product_id, 'increase')
      .pipe(finalize(() => 
        {
          this.isLoading = false;
          this.cdr.detectChanges();
  }))
      .subscribe(() => {
        item.quantity++;
        this.updateStockWarnings();
        this.calculateTotal();
      });
  }

  // ================= DECREASE =================
  decrease(item: any) {
    this.isLoading = true;
    this.checkoutError='';
    this.cartService.updateCart(item.product_id, 'decrease')
      .pipe(finalize(() => 
        {
          this.isLoading = false;
          this.cdr.detectChanges();
  }))
      .subscribe(() => {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          this.cartItems = this.cartItems.filter(i => i !== item);
        }
        this.updateStockWarnings();
        this.calculateTotal();
      });
  }

  // ================= REMOVE =================
  remove(item: any) {
    this.isLoading = true;
    this.checkoutError='';
    this.cartService.removeItem(item.id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
  }))
      .subscribe(() => {
        this.cartItems = this.cartItems.filter(i => i !== item);
        this.calculateTotal();
      });
  }

  // ================= CHECKOUT =================
  checkout() {
    this.checkoutError = '';

    const selectedItems = this.cartItems.filter(i => i.selected);

    if (selectedItems.length === 0) {
      this.checkoutError = 'Please select at least one product';
      return;
    }

    const hasStockIssue = selectedItems.some(
      i => this.stockWarnings[i.product_id]
    );

    if (hasStockIssue) {
      this.checkoutError = 'Fix stock issues before checkout';
      return;
    }

    const cartIds = selectedItems.map(i => i.id);
    this.checkoutService.setCartIds(cartIds);
    this.router.navigate(['/user/checkout']);
  }
}
