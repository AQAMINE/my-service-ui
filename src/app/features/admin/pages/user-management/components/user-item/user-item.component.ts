import { Component, computed, input, output } from '@angular/core';
import { User } from '../../models/user';
import { ViewMode } from '../user-filters-bar/user-filters-bar.component';

@Component({
  selector: 'app-user-item',
  standalone: true,
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss',
  host: {
    '[class.is-grid]': 'viewMode() === "grid"',
    '[class.is-list]': 'viewMode() === "list"',
    '[class.is-inactive]': '!user().enabled',
    '[class.is-toggling]': 'isToggling()'
  }
})
export class UserItem {
  readonly user = input.required<User>();
  readonly viewMode = input<ViewMode>('list');
  readonly isToggling = input(false);

  readonly statusChange = output<{ id: string; enabled: boolean }>();

  readonly displayName = computed(() => {
    const first = this.user().firstName?.trim() ?? '';
    const last = this.user().lastName?.trim() ?? '';
    const full = `${first} ${last}`.trim();
    return full || this.user().username;
  });

  readonly initials = computed(() => {
    const first = this.user().firstName?.trim();
    const last = this.user().lastName?.trim();
    if (first && last) {
      return `${first[0]}${last[0]}`.toUpperCase();
    }
    const source = this.displayName();
    return source.slice(0, 2).toUpperCase();
  });

  onToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.statusChange.emit({ id: this.user().id, enabled: input.checked });
  }
}
