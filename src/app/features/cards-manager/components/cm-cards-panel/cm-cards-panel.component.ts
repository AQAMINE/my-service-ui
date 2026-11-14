import { Component, input, output } from '@angular/core';
import { BankCard, ViewMode } from '../../models/bank-card';
import { CmCardItem } from '../cm-card-item/cm-card-item.component';

@Component({
  selector: 'app-cm-cards-panel',
  standalone: true,
  imports: [CmCardItem],
  templateUrl: './cm-cards-panel.component.html',
  styleUrl: './cm-cards-panel.component.scss'
})
export class CmCardsPanel {
  readonly cards = input.required<BankCard[]>();
  readonly viewMode = input<ViewMode>('grid');
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly retry = output<void>();
  readonly cardSelected = output<string>();
}
