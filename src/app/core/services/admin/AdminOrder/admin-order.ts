import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment'
@Injectable({
  providedIn: 'root',
})
export class AdminOrder {
  //  private apiUrl = 'http://127.0.0.1:8000/api/admin';
  private apiUrl = environment.apiBaseUrl+ '/admin';

  constructor(private http: HttpClient) {}

  /* =========================
   ORDERS
========================= */

getOrders() {
  return this.http.get<any[]>(`${this.apiUrl}/orders`);
}

updateOrderStatus(orderId: number, status: string) {
  return this.http.post(`${this.apiUrl}/orders/${orderId}/status`, {
    status,
  });
}
 getOrderHistory() {
    return this.http.get(`${this.apiUrl}/orders/history`);
  }

}
