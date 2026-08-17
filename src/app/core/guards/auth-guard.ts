import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // localStorage is unavailable during SSR — do not treat that as logged out
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.getToken()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};