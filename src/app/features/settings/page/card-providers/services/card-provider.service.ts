import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { CardProvider, CreateCardProviderRequest } from '../models/card-provider';

@Injectable({
  providedIn: 'root'
})
export class CardProviderService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.cardsApiUrl}/v1/card-providers`;

  getProviders(): Observable<CardProvider[]> {
    return this.http.get<CardProvider[]>(this.apiUrl);
  }

  createProvider(body: CreateCardProviderRequest): Observable<CardProvider> {
    return this.http.post<CardProvider>(this.apiUrl, body);
  }

  deleteProvider(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
