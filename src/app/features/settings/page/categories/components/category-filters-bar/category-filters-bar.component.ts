import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type CategorySortField = 'name' | 'createdAt';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';
export type OriginFilter = 'all' | 'system' | 'custom';

@Component({
  selector: 'app-category-filters-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './category-filters-bar.component.html',
  styleUrl: './category-filters-bar.component.scss'
})
export class CategoryFiltersBar {
  readonly search = input('');
  readonly origin = input<OriginFilter>('all');
  readonly sortField = input<CategorySortField>('name');
  readonly sortDirection = input<SortDirection>('asc');
  readonly viewMode = input<ViewMode>('list');

  readonly searchChange = output<string>();
  readonly originChange = output<OriginFilter>();
  readonly sortFieldChange = output<CategorySortField>();
  readonly sortDirectionChange = output<SortDirection>();
  readonly viewModeChange = output<ViewMode>();
  readonly createClick = output<void>();
}
