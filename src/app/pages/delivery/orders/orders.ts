import { ChangeDetectorRef, Component } from '@angular/core';
import { DeliveryService } from '../../../core/services/delivery/delivery-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {

   deliveries: any[] = [];

  constructor(private deliveryService: DeliveryService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.deliveryService.getDeliveryHistory().subscribe({
      next: (res: any) => {
        this.deliveries = res.orders;
        this.cdr.detectChanges();
      }
    });
  }
}
