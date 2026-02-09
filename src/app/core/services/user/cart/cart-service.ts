import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class CartService {
  
  //  private api = 'http://127.0.0.1:8000/api/user';
  private api = environment.apiBaseUrl+ '/user';
  constructor(private http: HttpClient) {}

  getCart() {
    return this.http.get<any>(`${this.api}/cart`);
  }

  updateCart(productId: number, action: 'increase' | 'decrease') {
    return this.http.post(`${this.api}/cart/update/${productId}`, { action });
  }

  removeItem(cartId: number) {
    return this.http.delete(`${this.api}/cart/remove/${cartId}`);
  }

 checkout(cartIds: number[]) {
  return this.http.post(`${this.api}/checkout`, {
    cart_ids: cartIds   // 🔥 EXACT KEY Laravel expects
  });
}

}
