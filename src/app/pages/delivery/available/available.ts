import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { DeliveryService } from '../../../core/services/delivery/delivery-service';
import { Spinner } from '../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

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
  this.isLoading = true;

  this.deliveryService.getAvailableOrders().subscribe({
    next: (res: any) => {
      console.log(res);

      this.orders = res.orders;
      this.isLoading = false;
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.isLoading = false;
      this.cdr.detectChanges();

      Swal.fire({
        title: err?.error?.message || 'Failed to load orders',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444'
      });
    }
  });
}

 acceptOrder(deliveryId: number) {
  this.isLoading = true;

  this.deliveryService.acceptOrder(deliveryId).subscribe({
    next: (res: any) => {
      this.isLoading = false;
      this.cdr.detectChanges();

      Swal.fire({
        title: res?.message || 'Order accepted successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#22c55e'
      }).then(() => {
        this.loadAvailableOrders(); // refresh list after alert close
      });
    },

    error: (err) => {
      this.isLoading = false;
      this.cdr.detectChanges();

      Swal.fire({
        title: err?.error?.message || 'Failed to accept order',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d4af37',
        background: 'linear-gradient(135deg, #3b0000, #1a0000)',
        color: '#ffffff',
        iconColor: '#ef4444'
      });
    }
  });
}

}
