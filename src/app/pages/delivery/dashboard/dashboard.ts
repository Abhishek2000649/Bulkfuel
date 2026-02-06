import { ChangeDetectorRef, Component } from '@angular/core';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Router } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery/delivery-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  deliveries: any[] = [];
  successMessage = '';
  errorMessage = '';
  constructor(private deliveryService: DeliveryService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.loadAssignedDeliveries();
  }
  loadAssignedDeliveries() {
    this.deliveryService.getAssignedDeliveries().subscribe({
      next: (res: any) => {
        console.log(res);
        this.deliveries = res.orders;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load deliveries';
      },
    });
  }
  markDelivered(deliveryId: number) {
    this.deliveryService.markDelivered(deliveryId).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Order delivered successfully';
        this.loadAssignedDeliveries();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to mark delivered';
      },
    });
  }
  cancelDelivery(deliveryId: number, reason: string) {
    if (!reason) {
      this.errorMessage = 'Cancel reason is required';
      return;
    }

    this.deliveryService.cancelDelivery(deliveryId, reason).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Delivery cancelled';
        this.loadAssignedDeliveries();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to cancel delivery';
      },
    });
  }

  getProductsByWarehouse(items: any[], warehouseId: number) {
    return items.filter((item) =>
      item.product.warehouse_products.some((wp: any) => wp.warehouse_id === warehouseId)
    );
  }
}
