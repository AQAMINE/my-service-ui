import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Bank, CreateBankRequest } from '../models/bank';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.cardsApiUrl}/v1/banks`;

  getBanks(): Observable<Bank[]> {
    return this.http.get<Bank[]>(this.apiUrl);
  }

  createBank(body: CreateBankRequest): Observable<Bank> {
    return this.http.post<Bank>(this.apiUrl, body);
  }

  deleteBank(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
