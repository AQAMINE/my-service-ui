import { Component, input, output } from '@angular/core';
import { CardProvider } from '../../models/card-provider';
import { ViewMode } from '../cp-filters-bar/cp-filters-bar.component';
import { CpItem } from '../cp-item/cp-item.component';

@Component({
  selector: 'app-cp-list-panel',
  standalone: true,
  imports: [CpItem],
  templateUrl: './cp-list-panel.component.html',
  styleUrl: './cp-list-panel.component.scss'
})
export class CpListPanel {
  readonly providers = input.required<CardProvider[]>();
  readonly viewMode = input<ViewMode>('list');
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly retry = output<void>();
  readonly deleteClick = output<CardProvider>();
}
