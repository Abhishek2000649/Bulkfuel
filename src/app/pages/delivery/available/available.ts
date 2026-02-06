import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { DeliveryService } from '../../../core/services/delivery/delivery-service';

@Component({
  selector: 'app-available',
  imports: [CommonModule],
  templateUrl: './available.html',
  styleUrl: './available.css',
})
export class Available {

  orders: any[] = [];
  successMessage = '';
  errorMessage = '';

  constructor(private deliveryService: DeliveryService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAvailableOrders();
  }

  loadAvailableOrders() {
    this.deliveryService.getAvailableOrders().subscribe({
      next: (res: any) => {
        console.log(res);
        
        this.orders = res.orders;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load orders';
      }
    });
  }

  acceptOrder(deliveryId: number) {
    this.deliveryService.acceptOrder(deliveryId).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Order accepted successfully';
        this.loadAvailableOrders(); // refresh list
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to accept order';
      }
    });
  }

}
