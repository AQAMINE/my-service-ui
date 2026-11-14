import { Component, input, output } from '@angular/core';
import { User } from '../../models/user';
import { ViewMode } from '../user-filters-bar/user-filters-bar.component';
import { UserItem } from '../user-item/user-item.component';

@Component({
  selector: 'app-user-list-panel',
  standalone: true,
  imports: [UserItem],
  templateUrl: './user-list-panel.component.html',
  styleUrl: './user-list-panel.component.scss'
})
export class UserListPanel {
  readonly users = input.required<User[]>();
  readonly viewMode = input<ViewMode>('list');
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly retry = output<void>();
  readonly statusChange = output<{ id: string; enabled: boolean }>();
  readonly togglingUserId = input<string | null>(null);
}
