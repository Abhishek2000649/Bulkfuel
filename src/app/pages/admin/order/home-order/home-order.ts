import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminOrder } from '../../../../core/services/admin/AdminOrder/admin-order';
import { Spinner } from '../../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-order',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './home-order.html',
  styleUrl: './home-order.css',
})
export class HomeOrder {

  openDropdownId: number | null = null;

// Toggle dropdown
toggleDropdown(orderId: number) {
  this.openDropdownId = this.openDropdownId === orderId ? null : orderId;
}

// Select status
selectStatus(orderId: number, status: string) {
  this.tempStatus[orderId] = status;
  this.openDropdownId = null; // close after select
}

// Click outside close
@HostListener('document:click', ['$event'])
handleClickOutside(event: any) {
  const clickedInside = event.target.closest('.dropdown-wrapper');
  if (!clickedInside) {
    this.openDropdownId = null;
  }
}
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
  this.isLoading = true;

  this.adminService.getOrders().subscribe({
    next: (res: any) => {
      this.orders = res?.data || [];

      // init temp status
      this.orders.forEach(order => {
        this.tempStatus[order.id] = order.status;
      });

      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.isLoading = false;
      console.error(err);

      Swal.fire({
        title: err.error?.message || 'Failed to load orders',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7f1d1d', // Dark red button
        background: 'linear-gradient(135deg, #3b0000, #1a0000)', // Dark red gradient
        color: '#ffffff',
        iconColor: '#dc2626' // Bright red icon
      });
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
  this.isLoading = true;
  const newStatus = this.tempStatus[orderId];

  

    this.adminService.updateOrderStatus(orderId, newStatus).subscribe({

      next: (res:any) => {
        this.isLoading = false;

        Swal.fire({
          title: 'Updated!',
          text: res?.message || 'Order status updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#7f1d1d',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff'
        });

        this.loadOrders(); 
      },

      error: (err) => {
        this.isLoading = false;
        console.error(err);

        Swal.fire({
          title: err.error?.message || 'Failed to update order status',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#7f1d1d',
          background: 'linear-gradient(135deg, #3b0000, #1a0000)',
          color: '#ffffff',
          iconColor: '#dc2626'
        });
      }

    });

 
}

  trackById(index: number, item: any) {
    return item.id;
  }
}
