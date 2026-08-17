import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExternalAccount } from '../models/external-account';

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

  // TODO: wire GET `${this.apiUrl}/${id}/password` when decrypt UI is ready
}
