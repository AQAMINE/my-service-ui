import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { Admin } from './admin.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: Admin,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'user-management' },
      {
        path: 'user-management',
        loadComponent: () =>
          import('./pages/user-management/user-management.component').then(
            (m) => m.UserManagement
          )
      }
    ]
  }
];
