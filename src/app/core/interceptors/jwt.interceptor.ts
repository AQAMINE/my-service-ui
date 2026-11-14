import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const userId = authService.getUserId();

  const isAuthRoute = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh');

  const headers: Record<string, string> = {};

  if (token && !isAuthRoute) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId && !isAuthRoute) {
    headers['X-User-Id'] = userId;
  }

  const clonedRequest = req.clone({
    withCredentials: true, // 👈 Obligatoire pour envoyer le cookie HttpOnly
    setHeaders: headers
  });

  return next(clonedRequest);
};