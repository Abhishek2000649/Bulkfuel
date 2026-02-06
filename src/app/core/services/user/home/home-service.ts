import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  
    private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getHomeData() {
    return this.http.get<any>(`${this.api}/user/`, );
  }

  updateCart(productId: number, action: 'increase' | 'decrease') {
    return this.http.post(`${this.api}/user/cart/update/${productId}`, { action });
  }
}
