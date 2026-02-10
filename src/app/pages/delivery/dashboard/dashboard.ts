import { ChangeDetectorRef, Component } from '@angular/core';
import { Auth } from '../../../core/services/Auth/authservice/auth';
import { Router } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery/delivery-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Spinner } from '../../../shared/spinner/spinner';

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
    this.isLoading=true;
    this.deliveryService.getAssignedDeliveries().subscribe({
      next: (res: any) => {
        console.log(res);
        this.deliveries = res.orders;
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading=false;
        this.errorMessage = 'Failed to load deliveries';
      },
    });
  }
  markDelivered(deliveryId: number) {
    this.isLoading=true;
    this.deliveryService.markDelivered(deliveryId).subscribe({
      next: (res: any) => {
        this.isLoading=false;
        this.successMessage = res.message || 'Order delivered successfully';
        this.loadAssignedDeliveries();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading=false;
        this.errorMessage = 'Failed to mark delivered';
      },
    });
  }
  cancelDelivery(deliveryId: number, reason: string) {
    this.isLoading=true;
    if (!reason) {
      this.errorMessage = 'Cancel reason is required';
      return;
    }

    this.deliveryService.cancelDelivery(deliveryId, reason).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Delivery cancelled';
        this.isLoading=false;
        this.loadAssignedDeliveries();
        
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading=false;
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
