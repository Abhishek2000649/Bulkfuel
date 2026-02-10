import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { DeliveryService } from '../../../core/services/delivery/delivery-service';
import { Spinner } from '../../../shared/spinner/spinner';

@Component({
  selector: 'app-available',
  imports: [CommonModule, Spinner],
  templateUrl: './available.html',
  styleUrl: './available.css',
})
export class Available {

  orders: any[] = [];
  successMessage = '';
  errorMessage = '';
  isLoading:boolean=false;
  constructor(private deliveryService: DeliveryService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAvailableOrders();
  }

  loadAvailableOrders() {
    this.isLoading=true;
    this.deliveryService.getAvailableOrders().subscribe({
      next: (res: any) => {
        console.log(res);
        
        this.orders = res.orders;
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading=false;
        this.errorMessage = 'Failed to load orders';
      }
    });
  }

  acceptOrder(deliveryId: number) {
    this.isLoading=true;
    this.deliveryService.acceptOrder(deliveryId).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Order accepted successfully';
        this.isLoading=false;
        this.loadAvailableOrders(); // refresh list
      },
      error: (err) => {
        this.isLoading=false;
        this.errorMessage = err.error?.message || 'Failed to accept order';
      }
    });
  }

}
