import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MyOrder {
  
   private apiUrl = 'http://127.0.0.1:8000/api/user';

  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-orders`);
  }
}
