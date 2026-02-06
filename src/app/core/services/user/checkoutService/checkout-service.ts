import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {

   private api = 'http://127.0.0.1:8000/api/user';

  constructor(private http: HttpClient) {}


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
  
}
