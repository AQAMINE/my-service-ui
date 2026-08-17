import { Component, computed, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Provider } from '../../../../../core/models/provider';
import { ViewMode } from '../provider-filters-bar/provider-filters-bar';

@Component({
  selector: 'app-provider-item',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './provider-item.html',
  styleUrl: './provider-item.scss',
  host: {
    '[class.is-grid]': 'viewMode() === "grid"',
    '[class.is-list]': 'viewMode() === "list"'
  }
})
export class ProviderItem {
  readonly provider = input.required<Provider>();
  readonly viewMode = input<ViewMode>('list');
  readonly deleteClick = output<Provider>();

  readonly logoFailed = signal(false);
  readonly isSystem = computed(() => this.provider().userId === null);
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
