import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type CardProviderSortField = 'name' | 'code';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';

@Component({
  selector: 'app-cp-filters-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cp-filters-bar.component.html',
  styleUrl: './cp-filters-bar.component.scss'
})
export class CpFiltersBar {
  readonly search = input('');
  readonly sortField = input<CardProviderSortField>('name');
  readonly sortDirection = input<SortDirection>('asc');
  readonly viewMode = input<ViewMode>('list');

  readonly searchChange = output<string>();
  readonly sortFieldChange = output<CardProviderSortField>();
  readonly sortDirectionChange = output<SortDirection>();
  readonly viewModeChange = output<ViewMode>();
  readonly createClick = output<void>();
}
