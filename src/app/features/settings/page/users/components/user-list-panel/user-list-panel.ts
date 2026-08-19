import { Component, input, output } from '@angular/core';
import { User } from '../../models/user';
import { ViewMode } from '../user-filters-bar/user-filters-bar';
import { UserItem } from '../user-item/user-item';

@Component({
  selector: 'app-user-list-panel',
  standalone: true,
  imports: [UserItem],
  templateUrl: './user-list-panel.html',
  styleUrl: './user-list-panel.scss'
})
export class UserListPanel {
  readonly users = input.required<User[]>();
  readonly viewMode = input<ViewMode>('list');
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly retry = output<void>();
}
