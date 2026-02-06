import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserManagement {
   private apiUrl = 'http://127.0.0.1:8000/api/admin';

  constructor(private http: HttpClient) {}

  // GET USERS (except ADMIN)
getUsers() {
  return this.http.get<any[]>(`${this.apiUrl}/users`);
}

// DELETE USER
deleteUser(id: number) {
  return this.http.delete(`${this.apiUrl}/users/delete/${id}`);
}
// ADD USER
addUser(data: any) {
  return this.http.post(`${this.apiUrl}/users/store/`, data);
}
// GET SINGLE USER
getUserById(id: number) {
  return this.http.get<any>(`${this.apiUrl}/users/edit/${id}`);
}

// UPDATE USER
updateUser(id: number, data: any) {
  return this.http.post(`${this.apiUrl}/users/update/${id}`, data);
}


}
