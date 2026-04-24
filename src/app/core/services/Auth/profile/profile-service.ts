import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  //  private apiUrl = 'http://127.0.0.1:8000/api';
  private apiUrl = environment.apiBaseUrl;


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
  getAddresses() {
  return this.http.get(`${this.apiUrl}/profile/addresses`);
}
setCurrentAddress(id: number) {
  return this.http.post(`${this.apiUrl}/profile/address/set-current/${id}`, {});
}

deleteAddress(id: number) {
  return this.http.delete(`${this.apiUrl}/profile/address/${id}`);
}
}
