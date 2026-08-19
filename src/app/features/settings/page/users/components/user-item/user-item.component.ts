import { Component, computed, input } from '@angular/core';
import { User } from '../../models/user';
import { ViewMode } from '../user-filters-bar/user-filters-bar.component';

@Component({
  selector: 'app-user-item',
  standalone: true,
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss',
  host: {
    '[class.is-grid]': 'viewMode() === "grid"',
    '[class.is-list]': 'viewMode() === "list"'
  }
})
export class UserItem {
  readonly user = input.required<User>();
  readonly viewMode = input<ViewMode>('list');

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
}
