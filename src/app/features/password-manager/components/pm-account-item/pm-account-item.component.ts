import { Component, computed, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ExternalAccount, ViewMode } from '../../models/external-account';

@Component({
  selector: 'app-pm-account-item',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './pm-account-item.component.html',
  styleUrl: './pm-account-item.component.scss',
  host: {
    '[class.is-grid]': 'viewMode() === "grid"',
    '[class.is-list]': 'viewMode() === "list"'
  }
})
export class PmAccountItem {
  readonly account = input.required<ExternalAccount>();
  readonly viewMode = input<ViewMode>('list');
  readonly accountClick = output<string>();

  private readonly logoFailed = signal(false);

  readonly showLogo = computed(() => {
    const url = this.account().provider.logoUrl;
    return !!url && !this.logoFailed();
  });

  readonly initials = computed(() => {
    const name = this.account().provider.name.trim();
    return name.slice(0, 2).toUpperCase();
  });

  readonly identity = computed(() => {
    const account = this.account();
    return account.username || account.email;
  });

  onLogoError(): void {
    this.logoFailed.set(true);
  }

  onSelect(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.accountClick.emit(this.account().id);
  }
}
