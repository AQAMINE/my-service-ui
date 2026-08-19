import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarNavItem {
  label: string;
  route: string;
  iconPaths?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss'
})
export class AppSidebar {
  readonly title = input('Menu');
  readonly items = input.required<SidebarNavItem[]>();
}
