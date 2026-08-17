import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CategorySummary,
  ProviderSummary,
  SortDirection,
  SortField,
  ViewMode
} from '../../models/external-account';

@Component({
  selector: 'app-pm-filters-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pm-filters-bar.html',
  styleUrl: './pm-filters-bar.scss'
})
export class PmFiltersBar {
  readonly search = input('');
  readonly categoryId = input('');
  readonly providerId = input('');
  readonly sortField = input<SortField>('updatedAt');
  readonly sortDirection = input<SortDirection>('desc');
  readonly viewMode = input<ViewMode>('list');
  readonly categories = input.required<CategorySummary[]>();
  readonly providers = input.required<ProviderSummary[]>();

  readonly searchChange = output<string>();
  readonly categoryIdChange = output<string>();
  readonly providerIdChange = output<string>();
  readonly sortFieldChange = output<SortField>();
  readonly sortDirectionChange = output<SortDirection>();
  readonly viewModeChange = output<ViewMode>();
}
