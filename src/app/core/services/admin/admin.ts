import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  
   private apiUrl = 'http://127.0.0.1:8000/api/admin';

  constructor(private http: HttpClient) {}

  addCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, data);
  }

   // GET CATEGORIES
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories/${id}`);
  }

  // UPDATE
  updateCategory(id: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/category/update/${id}`, data);
  }

  // DELETE CATEGORY
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }
}
