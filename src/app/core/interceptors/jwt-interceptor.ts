import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, switchMap, throwError } from 'rxjs';

let isRefreshing = false;

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Ne pas ajouter le header sur les routes d'authentification (/auth/login, /auth/refresh)
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  let authReq = req;
  if (token && !isAuthRequest) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };
    const userId = authService.getUserId();
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    authReq = req.clone({ setHeaders: headers });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si l'erreur est une 401 et que ce n'est pas déjà une requête de login/refresh
      if (error.status === 401 && !isAuthRequest) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;

    return authService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;
        const headers: Record<string, string> = {
          Authorization: `Bearer ${response.access_token}`
        };
        const userId = authService.getUserId();
        if (userId) {
          headers['X-User-Id'] = userId;
        }
        const newReq = req.clone({ setHeaders: headers });
        return next(newReq);
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  }

  return next(req);
}