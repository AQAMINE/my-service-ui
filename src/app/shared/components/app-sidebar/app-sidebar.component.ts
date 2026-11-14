import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarNavItem {
  label: string;
  route: string;
  iconPaths?: string[];
}

export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss'
})
export class AppSidebar {
  /** Used as the nav aria-label only; group headings come from `groups`. */
  readonly title = input('Menu');
  readonly groups = input.required<SidebarNavGroup[]>();
}
