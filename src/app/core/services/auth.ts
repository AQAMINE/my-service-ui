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

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
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

  // State principal sous forme de Signals
  isAuthenticated = signal<boolean>(!!this.getToken());
  userRoles = signal<string[]>(this.getRolesFromToken());

  // Computed signals pour l'IHM
  readonly isAdmin = computed(() => 
    this.userRoles().includes('ROLE_ADMIN') || this.userRoles().includes('ADMIN')
  );
  readonly isUser = computed(() => 
    this.userRoles().includes('ROLE_USER') || this.userRoles().includes('USER')
  );

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => this.saveTokens(response))
    );
  }

  /**
   * Appelle l'endpoint de refresh avec le Refresh Token actuel
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Aucun refresh token disponible'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => this.saveTokens(response)),
      catchError((err) => {
        // Si le refresh token est expiré ou invalide, déconnexion forcée
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    this.isAuthenticated.set(false);
    this.userRoles.set([]);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  getUserId(): string | null {
    const claims = this.decodeTokenClaims();
    return claims?.sub ?? null;
  }

  /**
   * Extrait la liste des rôles depuis la claim realm_access.roles de Keycloak
   */
  getRolesFromToken(): string[] {
    const claims = this.decodeTokenClaims();
    return claims?.realm_access?.roles ?? [];
  }

  private decodeTokenClaims(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = globalThis.atob(normalized);
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  private saveTokens(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    this.isAuthenticated.set(true);
    this.userRoles.set(this.getRolesFromToken());
  }
}