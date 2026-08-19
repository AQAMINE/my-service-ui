import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type UserSortField = 'username' | 'email';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';

@Component({
  selector: 'app-user-filters-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-filters-bar.html',
  styleUrl: './user-filters-bar.scss'
})
export class UserFiltersBar {
  readonly search = input('');
  readonly sortField = input<UserSortField>('username');
  readonly sortDirection = input<SortDirection>('asc');
  readonly viewMode = input<ViewMode>('list');

  readonly searchChange = output<string>();
  readonly sortFieldChange = output<UserSortField>();
  readonly sortDirectionChange = output<SortDirection>();
  readonly viewModeChange = output<ViewMode>();
  readonly createClick = output<void>();
}
