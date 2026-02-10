import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminOrder } from '../../../../core/services/admin/AdminOrder/admin-order';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-home-order',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './home-order.html',
  styleUrl: './home-order.css',
})
export class HomeOrder {
  orders: any[] = [];
  isLoading:boolean=false;
  // TEMP status (important)
  tempStatus: { [key: number]: string } = {};

  statuses = [
    'PENDING',
    'CONFIRMED',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  // status priority map
  statusPriority: { [key: string]: number } = {
    PENDING: 1,
    CONFIRMED: 2,
    PACKED: 3,
    SHIPPED: 4,
    OUT_FOR_DELIVERY: 5,
    DELIVERED: 6,
    CANCELLED: 7,
  };

  constructor(
    private adminService: AdminOrder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading=true;
    this.adminService.getOrders().subscribe({
      next: (res) => {
        this.orders = res;

        // init temp status
        this.orders.forEach(order => {
          this.tempStatus[order.id] = order.status;
        });
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: (err) => 
        {
          this.isLoading=false;
          console.error(err);
        }
    });
  }

  /** show order only if status < SHIPPED */
  shouldShowOrder(order: any): boolean {
    return (
      this.statusPriority[order.status] <
      this.statusPriority['SHIPPED']
    );
  }

  /** check if any visible order exists */
  hasVisibleOrders(): boolean {
    return this.orders?.some(order => this.shouldShowOrder(order));
  }

  updateStatus(orderId: number) {
    this.isLoading=true;
    const newStatus = this.tempStatus[orderId];

    if (!confirm('Are you sure to update order status?')) return;

    this.adminService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.isLoading=false;
        alert('Order status updated');
        this.loadOrders(); // reload → order removed if SHIPPED+
      },
      error: (err) => 
        {
          this.isLoading=false;
          console.error(err);
        }
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
