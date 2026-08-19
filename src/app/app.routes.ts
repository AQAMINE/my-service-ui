import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { PasswordManager } from './features/password-manager/password-manager';
import { Settings } from './features/settings/settings.component';
import { Categories } from './features/settings/page/categories/categories';
import { Providers } from './features/settings/page/providers/providers';
import { Users } from './features/settings/page/users/users';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'password-manager',
    component: PasswordManager,
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    component: Settings,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'categories' },
      { path: 'categories', component: Categories },
      { path: 'providers', component: Providers },
      { path: 'users', component: Users }
    ]
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
