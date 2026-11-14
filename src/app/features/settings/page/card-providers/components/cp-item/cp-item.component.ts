import { Component, computed, input, output, signal } from '@angular/core';
import { CardProvider, isSystemCardProvider } from '../../models/card-provider';
import { ViewMode } from '../cp-filters-bar/cp-filters-bar.component';

@Component({
  selector: 'app-cp-item',
  standalone: true,
  templateUrl: './cp-item.component.html',
  styleUrl: './cp-item.component.scss',
  host: {
    '[class.is-grid]': 'viewMode() === "grid"',
    '[class.is-list]': 'viewMode() === "list"'
  }
})
export class CpItem {
  readonly provider = input.required<CardProvider>();
  readonly viewMode = input<ViewMode>('list');
  readonly deleteClick = output<CardProvider>();

  readonly logoFailed = signal(false);
  readonly isSystem = computed(() => isSystemCardProvider(this.provider()));
  readonly showLogo = computed(() => !!this.provider().logoUrl && !this.logoFailed());
  readonly initials = computed(() => {
    const parts = this.provider().name.trim().split(/\s+/).filter(Boolean);
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
    this.deleteClick.emit(this.provider());
  }
}
