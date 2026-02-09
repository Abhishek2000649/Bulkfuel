import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class HomeService {
  
    // private api = 'http://127.0.0.1:8000/api';
    private api = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getHomeData() {
    return this.http.get<any>(`${this.api}/user/`, );
  }

  updateCart(productId: number, action: 'increase' | 'decrease') {
    return this.http.post(`${this.api}/user/cart/update/${productId}`, { action });
  }
}
