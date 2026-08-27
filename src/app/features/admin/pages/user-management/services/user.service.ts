import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { CreateUserRequest, User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(body: CreateUserRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, body);
  }

  toggleUserStatus(id: string, enabled: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, null, {
      params: { enabled }
    });
  }
}
