import { ChangeDetectorRef, Component } from '@angular/core';
import { MyOrder } from '../../../core/services/user/myOrder/my-order';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {

   orders: any[] = [];

  constructor(private ordersService: MyOrder, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.ordersService.getMyOrders().subscribe({
      next: (res: any) => {
        this.orders = res.orders;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders', err);
      }
    });
  }

}
