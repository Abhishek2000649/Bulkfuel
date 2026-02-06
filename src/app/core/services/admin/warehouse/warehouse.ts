import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Warehouse {
   private apiUrl = 'http://127.0.0.1:8000/api/admin';

  constructor(private http: HttpClient) {}
  // GET ALL WAREHOUSES
getWarehouses() {
  return this.http.get<any[]>(`${this.apiUrl}/warehouses`);
}

// DELETE WAREHOUSE
deleteWarehouse(id: number) {
  return this.http.delete(`${this.apiUrl}/warehouses/delete/${id}`);
}
// ADD WAREHOUSE
addWarehouse(data: any) {
  return this.http.post(`${this.apiUrl}/warehouses/store`, data);
}
// GET SINGLE WAREHOUSE
getWarehouseById(id: number) {
  return this.http.get<any>(`${this.apiUrl}/warehouses/${id}`);
}

// UPDATE WAREHOUSE
updateWarehouse(id: number, data: any) {
  return this.http.post(`${this.apiUrl}/warehouses/update/${id}`, data);
}

  
}
