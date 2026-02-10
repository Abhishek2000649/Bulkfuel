import { ChangeDetectorRef, Component } from '@angular/core';
import { MyOrder } from '../../../core/services/user/myOrder/my-order';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Spinner } from '../../../shared/spinner/spinner';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterModule, Spinner],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {

   orders: any[] = [];
  isLoading:boolean=false;
  constructor(private ordersService: MyOrder, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading=true;
    this.ordersService.getMyOrders().subscribe({
      next: (res: any) => {
        this.orders = res.orders;
        this.isLoading=false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading=false;
        console.error('Error loading orders', err);
      }
    });
  }

}
