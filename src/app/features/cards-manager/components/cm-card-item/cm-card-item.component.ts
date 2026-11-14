import { Component, computed, input, output, signal } from '@angular/core';
import { BankCard, ViewMode } from '../../models/bank-card';

@Component({
  selector: 'app-cm-card-item',
  standalone: true,
  templateUrl: './cm-card-item.component.html',
  styleUrl: './cm-card-item.component.scss',
  host: {
    '[class.is-grid]': 'viewMode() === "grid"',
    '[class.is-list]': 'viewMode() === "list"'
  }
})
export class CmCardItem {
  readonly card = input.required<BankCard>();
  readonly viewMode = input<ViewMode>('grid');

  readonly cardClick = output<string>();

  readonly bankLogoFailed = signal(false);
  readonly providerLogoFailed = signal(false);

  readonly surfaceColor = computed(
    () => this.card().cardColor || this.card().bank.primaryColor || '#1A1A1A'
  );

  readonly maskedPan = computed(() => `•••• •••• •••• ${this.card().lastFourDigits}`);

  readonly expiryLabel = computed(() => {
    const month = String(this.card().expiryMonth).padStart(2, '0');
    const year = String(this.card().expiryYear).slice(-2);
    return `${month}/${year}`;
  });

  onBankLogoError(): void {
    this.bankLogoFailed.set(true);
  }

  onProviderLogoError(): void {
    this.providerLogoFailed.set(true);
  }

  onClick(): void {
    this.cardClick.emit(this.card().id);
  }
}
