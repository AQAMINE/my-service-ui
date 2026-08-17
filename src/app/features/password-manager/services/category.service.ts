import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoryOption } from '../models/external-account';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/categories`;

  getCategories(): Observable<CategoryOption[]> {
    return this.http.get<CategoryOption[]>(this.apiUrl);
  }
}
