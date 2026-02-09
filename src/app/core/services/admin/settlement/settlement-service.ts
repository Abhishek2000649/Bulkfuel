import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SettlementService {

    // private baseUrl = 'http://127.0.0.1:8000/api/admin';
    private baseUrl = environment.apiBaseUrl+ '/admin';

  constructor(private http: HttpClient) {}

  // ✅ Get all delivery agents
  getDeliveryAgents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/delivery-agents`);
  }

  // ✅ Get pending settlement for selected agent
  getPendingSettlement(agentId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/settlement/pending/${agentId}`
    );
  }

  // ✅ Complete settlement (ADMIN action)
  completeSettlement(payload: {
    settlement_id: number;
    settlement_mode: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/settlement/complete`,
      payload
    );
  }
  
}
