import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  constructor(private http: HttpClient) {}
  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.userSubject.next(null);
      })
    );
  }

 me(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/me`).pipe(
    tap((res) => {
      this.userSubject.next(res.user); 
    })
  );
}


  setUser(user: any) {
    this.userSubject.next(user);
  }

  get currentUser() {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get user() {
    return this.userSubject.value;
  }
}
