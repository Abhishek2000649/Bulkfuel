import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class DeliveryService {

  // private apiUrl = 'http://127.0.0.1:8000/api/delivery';
private apiUrl = environment.apiBaseUrl+ '/delivery';
  constructor(private http: HttpClient) {}

  getAvailableOrders() {
    return this.http.get(`${this.apiUrl}/available`);
  }

  acceptOrder(deliveryId: number) {
    return this.http.post(`${this.apiUrl}/accept/${deliveryId}`, {});
  }

  
  getAssignedDeliveries() {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  
  markDelivered(id: number) {
    return this.http.post(`${this.apiUrl}/delivered/${id}`, {});
  }

  
  cancelDelivery(id: number, reason: string) {
    return this.http.post(`${this.apiUrl}/cancel/${id}`, {
      cancel_reason: reason,
    });
  }

  getDeliveryHistory() {
    return this.http.get(`${this.apiUrl}/history`);
}

}
