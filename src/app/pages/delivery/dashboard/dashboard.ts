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
  this.isLoading = true;

  this.deliveryService.markDelivered(deliveryId).subscribe({
    next: (res: any) => {
      this.isLoading = false;

      Swal.fire({
        title: res?.message || 'Order delivered successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#22c55e'
      }).then(() => {
        this.loadAssignedDeliveries(); // refresh after alert close
        this.cdr.detectChanges();
      });
    },

    error: (err) => {
      this.isLoading = false;

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
 cancelDelivery(deliveryId: number, reason: string) {
  this.isLoading = true;

 
  if (!reason) {
    this.isLoading = false;

   this.errorMessage = 'Cancellation reason is required';

    return;
  }

  this.deliveryService.cancelDelivery(deliveryId, reason).subscribe({

    
    next: (res: any) => {
      this.isLoading = false;

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

  getProductsByWarehouse(items: any[], warehouseId: number) {
    return items.filter((item) =>
      item.product.warehouse_products.some((wp: any) => wp.warehouse_id === warehouseId)
    );
  }
}
