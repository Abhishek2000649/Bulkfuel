import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
   private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // 🔹 get profile
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  // 🔹 update name & email
  updateBasic(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/basic`, data);
  }

  // 🔹 update address
  updateAddress(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/address`, data);
  }

  // 🔹 update password
  updatePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/password`, data);
  }
}
