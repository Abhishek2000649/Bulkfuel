import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminOrder } from '../../../../core/services/admin/AdminOrder/admin-order';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, Spinner],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistory implements OnInit {

  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoading:boolean= false;
  // ✅ FIXED STATUS LIST
  statuses: string[] = [
    'ALL',
    'PENDING',
    'CONFIRMED',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  selectedStatus: string = 'ALL';

  constructor(
    private orderService: AdminOrder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getOrders();
  }

  // ================= FETCH ORDERS =================
  getOrders(): void {
    this.isLoading=true;
    this.orderService.getOrderHistory().subscribe({
      next: (res: any) => {
        this.orders = res.orders || [];
        this.filteredOrders = [...this.orders];
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading=false;
        console.error('Error fetching orders', err);
      },
    });
  }

  // ================= FILTER =================
  filterOrders(status: string): void {
    this.selectedStatus = status;

    if (status === 'ALL') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(
        order => order.status === status
      );
    }
  }

  // ================= TRACK BY =================
  trackByItemId(index: number, item: any): any {
    return item?.id || index;
  }

  // ================= TOTAL =================
  getOrderTotal(order: any): number {
    if (!order?.items) return 0;

    return order.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
  }
}
