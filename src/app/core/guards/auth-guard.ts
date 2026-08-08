import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Ajuste le chemin si besoin

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifie si le token est présent (ou si la signal/méthode indique l'authentification)
  if (authService.getToken()) {
    return true; // L'accès au Dashboard est autorisé
  }

  // Si l'utilisateur n'est pas connecté, redirection vers le login
  return router.createUrlTree(['/login']);
};