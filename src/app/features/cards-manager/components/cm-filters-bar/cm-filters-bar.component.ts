import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BankSummary,
  CardProviderSummary,
  SortDirection,
  SortField,
  ViewMode
} from '../../models/bank-card';

@Component({
  selector: 'app-cm-filters-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cm-filters-bar.component.html',
  styleUrl: './cm-filters-bar.component.scss'
})
export class CmFiltersBar {
  readonly search = input('');
  readonly bankId = input('');
  readonly providerId = input('');
  readonly sortField = input<SortField>('updatedAt');
  readonly sortDirection = input<SortDirection>('desc');
  readonly viewMode = input<ViewMode>('grid');
  readonly banks = input.required<BankSummary[]>();
  readonly providers = input.required<CardProviderSummary[]>();

  readonly searchChange = output<string>();
  readonly bankIdChange = output<string>();
  readonly providerIdChange = output<string>();
  readonly sortFieldChange = output<SortField>();
  readonly sortDirectionChange = output<SortDirection>();
  readonly viewModeChange = output<ViewMode>();
  readonly createClick = output<void>();
}
