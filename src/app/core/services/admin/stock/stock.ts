import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Stock {

   private apiUrl = 'http://127.0.0.1:8000/api/admin';

  constructor(private http: HttpClient) {}

  // GET STOCK LIST (with warehouse & product)
getStocks() {
  return this.http.get<any[]>(`${this.apiUrl}/stock`);
}

// DELETE STOCK
deleteStock(id: number) {
  return this.http.post(`${this.apiUrl}/stock/delete/${id}`, {});
}
// GET WAREHOUSES
getWarehouses(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/warehouses`);
}

// ADD STOCK
addStock(data: any) {
  return this.http.post(`${this.apiUrl}/stock/store`, data);
}


  /* =========================
     PRODUCTS  ✅ REQUIRED
  ========================= */

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }
  // GET SINGLE STOCK
getStockById(id: number) {
  return this.http.get<any>(`${this.apiUrl}/stock/${id}`);
}

// UPDATE STOCK
updateStock(id: number, data: any) {
  return this.http.put(`${this.apiUrl}/stock/update/${id}`, data);
}

}
