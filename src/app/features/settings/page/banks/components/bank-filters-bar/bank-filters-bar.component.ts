import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type BankSortField = 'name' | 'code';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';
export type OriginFilter = 'all' | 'system' | 'custom';

@Component({
  selector: 'app-bank-filters-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './bank-filters-bar.component.html',
  styleUrl: './bank-filters-bar.component.scss'
})
export class BankFiltersBar {
  readonly search = input('');
  readonly origin = input<OriginFilter>('all');
  readonly sortField = input<BankSortField>('name');
  readonly sortDirection = input<SortDirection>('asc');
  readonly viewMode = input<ViewMode>('list');

  readonly searchChange = output<string>();
  readonly originChange = output<OriginFilter>();
  readonly sortFieldChange = output<BankSortField>();
  readonly sortDirectionChange = output<SortDirection>();
  readonly viewModeChange = output<ViewMode>();
  readonly createClick = output<void>();
}
