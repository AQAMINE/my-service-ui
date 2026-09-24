import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type ProviderSortField = 'name' | 'createdAt';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';
export type OriginFilter = 'all' | 'system' | 'custom';

@Component({
  selector: 'app-provider-filters-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './provider-filters-bar.component.html',
  styleUrl: './provider-filters-bar.component.scss'
})
export class ProviderFiltersBar {
  readonly search = input('');
  readonly origin = input<OriginFilter>('all');
  readonly sortField = input<ProviderSortField>('name');
  readonly sortDirection = input<SortDirection>('asc');
  readonly viewMode = input<ViewMode>('list');

  readonly searchChange = output<string>();
  readonly originChange = output<OriginFilter>();
  readonly sortFieldChange = output<ProviderSortField>();
  readonly sortDirectionChange = output<SortDirection>();
  readonly viewModeChange = output<ViewMode>();
  readonly createClick = output<void>();
}
