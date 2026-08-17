import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProviderOption } from '../models/external-account';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/providers`;

  getProviders(): Observable<ProviderOption[]> {
    return this.http.get<ProviderOption[]>(this.apiUrl);
  }
}
