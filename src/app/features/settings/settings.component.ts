import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppSidebar, SidebarNavItem } from '../../shared/components/app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterOutlet, AppSidebar],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class Settings {
  private router = inject(Router);

  readonly navItems: SidebarNavItem[] = [
    {
      label: 'Catégories',
      route: '/settings/categories',
      iconPaths: [
        'M4 6.5A2.5 2.5 0 016.5 4h4.2L13 6.3h4.5A2.5 2.5 0 0120 8.8v8.7A2.5 2.5 0 0117.5 20h-11A2.5 2.5 0 014 17.5v-11z'
      ]
    },
    {
      label: 'Providers',
      route: '/settings/providers',
      iconPaths: [
        'M4 7.5A3.5 3.5 0 017.5 4h9A3.5 3.5 0 0120 7.5v9A3.5 3.5 0 0116.5 20h-9A3.5 3.5 0 014 16.5v-9z',
        'M8 12h8M12 8v8'
      ]
    },
    {
      label: 'Utilisateurs',
      route: '/settings/users',
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
