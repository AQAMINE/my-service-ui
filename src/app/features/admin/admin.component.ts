import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppSidebar, SidebarNavItem } from '../../shared/components/app-sidebar/app-sidebar.component';
import { AdminHeader } from './components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, AppSidebar, AdminHeader],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class Admin {
  private router = inject(Router);

  readonly navItems: SidebarNavItem[] = [
    {
      label: 'Utilisateurs',
      route: '/admin/user-management',
      iconPaths: [
        'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2',
        'M9 11a4 4 0 100-8 4 4 0 000 8z',
        'M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'
      ]
    }
  ];

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
