import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateExternalAccountRequest, ExternalAccount } from '../models/external-account';

@Injectable({
  providedIn: 'root'
})
export class ExternalAccountService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/accounts`;

  getAccounts(): Observable<ExternalAccount[]> {
    return this.http.get<ExternalAccount[]>(this.apiUrl);
  }

  getAccountById(id: string): Observable<ExternalAccount> {
    return this.http.get<ExternalAccount>(`${this.apiUrl}/${id}`);
  }

  getAccountPassword(id: string): Observable<{ password: string }> {
    return this.http.get<{ password: string }>(`${this.apiUrl}/${id}/password`);
  }

  createAccount(body: CreateExternalAccountRequest): Observable<ExternalAccount> {
    return this.http.post<ExternalAccount>(this.apiUrl, body);
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
