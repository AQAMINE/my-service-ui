import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AccessTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

interface JwtPayload {
  sub?: string;
  realm_access?: {
    roles?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  private apiUrl = `${environment.apiUrl}/auth`;

  // Access token gardé uniquement en mémoire RAM
  private accessToken = signal<string | null>(null);

  // States réactifs pour l'IHM
  isAuthenticated = computed(() => !!this.accessToken());
  userRoles = signal<string[]>([]);

  readonly isAdmin = computed(() => 
    this.userRoles().includes('ROLE_ADMIN') || this.userRoles().includes('ADMIN')
  );
  readonly isUser = computed(() => 
    this.userRoles().includes('ROLE_USER') || this.userRoles().includes('USER')
  );

  login(credentials: LoginRequest): Observable<AccessTokenResponse> {
    return this.http.post<AccessTokenResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap((response) => this.setSession(response.accessToken))
    );
  }

  /**
   * Tente de récupérer un access_token via le Cookie HttpOnly (au F5 ou au démarrage)
   */
  refreshToken(): Observable<AccessTokenResponse> {
    return this.http.post<AccessTokenResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap((response) => this.setSession(response.accessToken)),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  getToken(): string | null {
    return this.accessToken();
  }

  getUserId(): string | null {
    const claims = this.decodeTokenClaims();
    return claims?.sub ?? null;
  }

  private setSession(token: string): void {
    this.accessToken.set(token);
    const claims = this.decodeTokenClaims();
    this.userRoles.set(claims?.realm_access?.roles ?? []);
  }

  private clearSession(): void {
    this.accessToken.set(null);
    this.userRoles.set([]);
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
    }
  }

  private decodeTokenClaims(): JwtPayload | null {
    const token = this.accessToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = globalThis.atob(normalized);
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }
}