import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
   private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}
  // 🔹 Send Message
  private getRolePath(role: string): string {
  if (role === 'USER') return 'user';
  if (role === 'delivery_agent') return 'delivery';
  if (role === 'ADMIN') return 'admin';
  return '';
}
//work
  sendMessage(data: any, role: string): Observable<any> {
  const path = this.getRolePath(role);
  return this.http.post(`${this.apiUrl}/${path}/chat/send`, data);
}
//work
getMessages(conversationId: number, role: string): Observable<any> {
  const path = this.getRolePath(role);
  return this.http.get(`${this.apiUrl}/${path}/chat/messages/${conversationId}`);
}

markSeen(conversationId: number, role: string): Observable<any> {
  const path = this.getRolePath(role);
  return this.http.post(`${this.apiUrl}/${path}/chat/seen`, {
    conversation_id: conversationId
  });
}

getAdminUsers(): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/contactusers`);
}
  


}
