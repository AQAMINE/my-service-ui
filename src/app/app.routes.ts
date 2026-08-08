import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login'; // Ajuste selon la structure
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login 
  },
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [authGuard] // 👈 Le Guard protège cette route !
  },
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];