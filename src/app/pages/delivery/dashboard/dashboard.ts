import { ChangeDetectorRef, Component } from '@angular/core';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Router } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery/delivery-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Spinner } from '../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  deliveries: any[] = [];
  successMessage = '';
  errorMessage = '';
  isLoading:boolean=false;
  constructor(private deliveryService: DeliveryService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.loadAssignedDeliveries();
  }
  loadAssignedDeliveries() {
  this.isLoading = true;

  this.deliveryService.getAssignedDeliveries().subscribe({
    next: (res: any) => {
      console.log(res);
      this.deliveries = res.orders;
      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.isLoading = false;
      this.cdr.detectChanges();

      Swal.fire({
        title: err?.error?.message || 'Failed to load deliveries',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444'
      });
    },
  });
}
markDelivered(deliveryId: number) {

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to mark this order as delivered?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Deliver it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#22c55e',
    cancelButtonColor: '#ef4444',
    background: 'linear-gradient(135deg, #3b0000, #1a0000)',
    color: '#ffffff',
  }).then((result) => {

    if (result.isConfirmed) {
      this.isLoading = true;

      this.deliveryService.markDelivered(deliveryId).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          Swal.fire({
            title: res?.message || 'Order delivered successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#22c55e'
          }).then(() => {
            this.loadAssignedDeliveries();
            this.cdr.detectChanges();
          });
        },

        error: (err) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          Swal.fire({
            title: err?.error?.message || 'Failed to mark delivered',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444'
          });
        },
      });

    }
  });
}
cancelDelivery(deliveryId: number, reason: string) {

  if (!reason) {
    this.errorMessage = 'Cancellation reason is required';
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to cancel this delivery?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel it!',
    cancelButtonText: 'No',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#22c55e',
    background: 'linear-gradient(135deg, #3b0000, #1a0000)',
    color: '#ffffff',
  }).then((result) => {

    if (result.isConfirmed) {
      this.isLoading = true;

      this.deliveryService.cancelDelivery(deliveryId, reason).subscribe({

        next: (res: any) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          Swal.fire({
            title: res?.message || 'Delivery cancelled successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#22c55e'
          }).then(() => {
            this.loadAssignedDeliveries();
            this.cdr.detectChanges();
          });
        },

        error: (err) => {
          this.isLoading = false;
          this.cdr.detectChanges();

          Swal.fire({
            title: err?.error?.message || 'Failed to cancel delivery',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d4af37',
            background: 'linear-gradient(135deg, #3b0000, #1a0000)',
            color: '#ffffff',
            iconColor: '#ef4444'
          });
        },
      });
    }
  });
}

  getProductsByWarehouse(items: any[], warehouseId: number) {
    return items.filter((item) =>
      item.product.warehouse_products.some((wp: any) => wp.warehouse_id === warehouseId)
    );
  }
}
