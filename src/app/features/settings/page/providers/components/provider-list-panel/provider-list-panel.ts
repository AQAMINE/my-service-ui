import { Component, input, output } from '@angular/core';
import { Provider } from '../../models/provider';
import { ViewMode } from '../provider-filters-bar/provider-filters-bar';
import { ProviderItem } from '../provider-item/provider-item';

@Component({
  selector: 'app-provider-list-panel',
  standalone: true,
  imports: [ProviderItem],
  templateUrl: './provider-list-panel.html',
  styleUrl: './provider-list-panel.scss'
})
export class ProviderListPanel {
  readonly providers = input.required<Provider[]>();
  readonly viewMode = input<ViewMode>('list');
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly retry = output<void>();
  readonly deleteClick = output<Provider>();
}
