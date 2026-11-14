import { Component, computed, input, output, signal } from '@angular/core';
import { Bank, isSystemBank } from '../../models/bank';
import { ViewMode } from '../bank-filters-bar/bank-filters-bar.component';

@Component({
  selector: 'app-bank-item',
  standalone: true,
  templateUrl: './bank-item.component.html',
  styleUrl: './bank-item.component.scss',
  host: {
    '[class.is-grid]': 'viewMode() === "grid"',
    '[class.is-list]': 'viewMode() === "list"'
  }
})
export class BankItem {
  readonly bank = input.required<Bank>();
  readonly viewMode = input<ViewMode>('list');
  readonly deleteClick = output<Bank>();

  readonly logoFailed = signal(false);
  readonly isSystem = computed(() => isSystemBank(this.bank()));
  readonly showLogo = computed(() => !!this.bank().logoUrl && !this.logoFailed());
  readonly accent = computed(() => this.bank().primaryColor || 'var(--color-primary)');
  readonly initials = computed(() => {
    const parts = this.bank().name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  });

  onLogoError(): void {
    this.logoFailed.set(true);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (this.isSystem()) {
      return;
    }
    this.deleteClick.emit(this.bank());
  }
}
