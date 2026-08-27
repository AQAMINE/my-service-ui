import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard.component';
import { PasswordManager } from './features/password-manager/password-manager.component';
import { Settings } from './features/settings/settings.component';
import { Categories } from './features/settings/page/categories/categories.component';
import { Providers } from './features/settings/page/providers/providers.component';
import { CardProviders } from './features/settings/page/card-providers/card-providers.component';
import { Banks } from './features/settings/page/banks/banks.component';
import { authGuard } from './core/guards/auth.guard';

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
    path: 'cards-manager',
    loadComponent: () =>
      import('./features/cards-manager').then((m) => m.CardsManager),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
  },
  {
    path: 'settings/users',
    redirectTo: '/admin/user-management',
    pathMatch: 'full'
  },
  {
    path: 'settings',
    component: Settings,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'categories' },
      { path: 'categories', component: Categories },
      { path: 'providers', component: Providers },
      { path: 'card-providers', component: CardProviders },
      { path: 'banks', component: Banks }
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
