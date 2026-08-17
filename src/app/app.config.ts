import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor'; // Ajuste le chemin selon ton projet

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // Injection du client HTTP avec notre intercepteur JWT
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    )
  ]
};