import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Product {
   private apiUrl = 'http://127.0.0.1:8000/api/admin';

  constructor(private http: HttpClient) {}
  

  // GET PRODUCTS (with category)
getProducts() {
  return this.http.get<any[]>(`${this.apiUrl}/products`);
}

// DELETE PRODUCT
deleteProduct(id: number) {
  return this.http.delete(`${this.apiUrl}/products/delete/${id}`);
}

// GET CATEGORIES (for dropdown)
getCategories() {
  return this.http.get<any[]>(`${this.apiUrl}/categories`);
}

// ADD PRODUCT
addProduct(data: any) {
  return this.http.post(`${this.apiUrl}/products/store`, data);
}

// GET SINGLE PRODUCT
getProductById(id: number) {
  return this.http.get<any>(`${this.apiUrl}/products/edit/${id}`);
}

// UPDATE PRODUCT
updateProduct(id: number, data: any) {
  // backend uses PUT
  return this.http.put(`${this.apiUrl}/products/update/${id}`, data);
}


}
