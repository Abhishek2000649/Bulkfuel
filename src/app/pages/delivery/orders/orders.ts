import { ChangeDetectorRef, Component } from '@angular/core';
import { DeliveryService } from '../../../core/services/delivery/delivery-service';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../shared/spinner/spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, Spinner],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {

   deliveries: any[] = [];
  isLoading:boolean=false;
  constructor(private deliveryService: DeliveryService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
  this.isLoading = true;

  this.deliveryService.getDeliveryHistory().subscribe({
    next: (res: any) => {
      this.isLoading = false;
      this.deliveries = res.orders;
      this.cdr.detectChanges();
    },

    error: (err) => {
      this.isLoading = false;

      Swal.fire({
        title: err?.error?.message || 'Failed to load delivery history',
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
