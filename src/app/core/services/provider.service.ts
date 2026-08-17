import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateProviderRequest, Provider } from '../models/provider';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/providers`;

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.apiUrl);
  }

  createProvider(body: CreateProviderRequest): Observable<Provider> {
    return this.http.post<Provider>(this.apiUrl, body);
  }

  deleteProvider(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
