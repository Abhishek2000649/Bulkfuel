import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/user/cart/cart-service';
import { CheckoutService } from '../../../core/services/user/checkoutService/checkout-service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
})
export class Cart {

  cartItems: any[] = [];
  selectedTotal = 0;
  selectAll = false;
  checkoutError = '';

  stockWarnings: Record<number, string> = {};

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router,
    private cdr:ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart().subscribe(res => {
      this.cartItems = res.cartItems.map((item: any) => ({
        ...item,
        selected: false
      }));

      this.updateStockWarnings();
      this.calculateTotal();
      this.cdr.detectChanges();
    });
  }

  toggleSelectAll() {
    this.cartItems.forEach(item => item.selected = this.selectAll);
    this.calculateTotal();
  }

  calculateTotal() {
    this.selectedTotal = this.cartItems
      .filter(item => item.selected)
      .reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
  }

  updateStockWarnings() {
    this.stockWarnings = {};

    this.cartItems.forEach(item => {
      if (item.quantity > item.product.totalStock) {
        this.stockWarnings[item.product_id] =
          `Only ${item.product.totalStock} items available`;
      }
    });
  }

  increase(item: any) {
    if (item.quantity >= item.product.totalStock) return;

    this.cartService.updateCart(item.product_id, 'increase')
      .subscribe(() => {
        item.quantity++;
        this.updateStockWarnings();
        this.calculateTotal();
      });
  }

  decrease(item: any) {
    this.cartService.updateCart(item.product_id, 'decrease')
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

  remove(item: any) {
    this.cartService.removeItem(item.id).subscribe(() => {
      this.cartItems = this.cartItems.filter(i => i !== item);
      this.calculateTotal();
    });
  }

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
