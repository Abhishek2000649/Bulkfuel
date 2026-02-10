import { ChangeDetectorRef, Component } from '@angular/core';
import { DeliveryService } from '../../../core/services/delivery/delivery-service';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../../shared/spinner/spinner';

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
    this.isLoading=true;
    this.deliveryService.getDeliveryHistory().subscribe({
      next: (res: any) => {
        this.isLoading=false;
        this.deliveries = res.orders;
        this.cdr.detectChanges();
      }
    });
  }
}
