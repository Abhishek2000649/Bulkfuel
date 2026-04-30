import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class CheckoutService {

  //  private api = 'http://127.0.0.1:8000/api/user';
  private api = environment.apiBaseUrl + '/user';

  constructor(private http: HttpClient) { }


  private cartIds: number[] = [];

  setCartIds(ids: number[]) {
    this.cartIds = ids;
    localStorage.setItem('checkout_cart_ids', JSON.stringify(ids));
  }

  getCartIds(): number[] {
    if (this.cartIds.length > 0) {
      return this.cartIds;
    }

    const saved = localStorage.getItem('checkout_cart_ids');
    return saved ? JSON.parse(saved) : [];
  }

  clear() {
    this.cartIds = [];
    localStorage.removeItem('checkout_cart_ids');
  }

  placeOrder(data: any) {
    return this.http.post<any>(`${this.api}/place-order`, data);
  }
  updateAddress(data: any) {
    return this.http.put<any>(`${this.api}/update-address`, data);
  }
  getUserAddress() {
    return this.http.get<any>(`${this.api}/get-address`);
  }
  createRazorpayOrder(orderId: number) {
    return this.http.post(`${this.api}/payments/create-order`, {
      order_id: orderId
    });
  }
  verifyPayment(data: any) {
    return this.http.post(`${this.api}/payments/verify`, data);
  }

  cancelOrder(orderId: number) {
  return this.http.post(`${this.api}/cancel-order/${orderId}`, {});
}
}
