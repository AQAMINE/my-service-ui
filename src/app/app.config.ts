import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AuthService } from './core/services/auth';

function initializeApp() {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  return () => {
    if (isPlatformBrowser(platformId)) {
      // Tente de récupérer la session via le cookie HttpOnly
      return firstValueFrom(authService.refreshToken()).catch(() => {
        // En cas d'échec (pas de cookie ou expiré), l'utilisateur reste non connecté
      });
    }
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true
    }
  ]
};