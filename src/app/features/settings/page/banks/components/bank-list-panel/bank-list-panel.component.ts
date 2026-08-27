import { Component, input, output } from '@angular/core';
import { Bank } from '../../models/bank';
import { ViewMode } from '../bank-filters-bar/bank-filters-bar.component';
import { BankItem } from '../bank-item/bank-item.component';

@Component({
  selector: 'app-bank-list-panel',
  standalone: true,
  imports: [BankItem],
  templateUrl: './bank-list-panel.component.html',
  styleUrl: './bank-list-panel.component.scss'
})
export class BankListPanel {
  readonly banks = input.required<Bank[]>();
  readonly viewMode = input<ViewMode>('list');
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly retry = output<void>();
  readonly deleteClick = output<Bank>();
}
