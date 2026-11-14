import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { User } from './models/user';
import { UserService } from './services/user.service';
import {
  SortDirection,
  UserFiltersBar,
  UserSortField,
  ViewMode
} from './components/user-filters-bar/user-filters-bar.component';
import { UserListPanel } from './components/user-list-panel/user-list-panel.component';
import { extractApiError } from '../../../../core/utils/slugify';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CreateUserModal } from './components/create-user-modal/create-user-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [UserFiltersBar, UserListPanel, CreateUserModal],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  private notificationService = inject(NotificationService);

  private readonly users = signal<User[]>([]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  readonly sortField = signal<UserSortField>('username');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly viewMode = signal<ViewMode>('list');
  readonly isCreateOpen = signal(false);
  readonly togglingUserId = signal<string | null>(null);

  readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    const sortField = this.sortField();
    const sortDirection = this.sortDirection();

    let result = this.users().filter((user) => {
      if (!query) {
        return true;
      }
      return [user.username, user.email, user.firstName ?? '', user.lastName ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query);
    });

    result = [...result].sort((a, b) => {
      const left = (a[sortField] ?? '').toLowerCase();
      const right = (b[sortField] ?? '').toLowerCase();
      const cmp = left.localeCompare(right);
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.users.set([]);
        this.isLoading.set(false);
        this.errorMessage.set(this.loadError(err));
      }
    });
  }

  onCreated(): void {
    this.isCreateOpen.set(false);
    this.loadUsers();
  }

  onStatusChange(event: { id: string; enabled: boolean }): void {
    const previous = this.users().find((user) => user.id === event.id);
    if (!previous || previous.enabled === event.enabled) {
      return;
    }

    this.users.update((users) =>
      users.map((user) => (user.id === event.id ? { ...user, enabled: event.enabled } : user))
    );
    this.togglingUserId.set(event.id);

    this.userService.toggleUserStatus(event.id, event.enabled).subscribe({
      next: () => {
        this.togglingUserId.set(null);
        const label = this.displayLabel(previous);
        if (event.enabled) {
          this.notificationService.showSuccess(
            'Accès activé',
            `${label} peut à nouveau se connecter.`
          );
        } else {
          this.notificationService.showWarning(
            'Accès désactivé',
            `${label} ne peut plus se connecter à l'application.`
          );
        }
      },
      error: (err: unknown) => {
        this.users.update((users) =>
          users.map((user) =>
            user.id === event.id ? { ...user, enabled: previous.enabled } : user
          )
        );
        this.togglingUserId.set(null);
        this.notificationService.showError(
          'Modification impossible',
          extractApiError(err, 'Impossible de modifier le statut du compte.')
        );
      }
    });
  }

  private displayLabel(user: User): string {
    const full = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return full || user.username;
  }

  private loadError(err: unknown): string {
    if (err instanceof HttpErrorResponse && err.status === 403) {
      return 'Accès refusé. La gestion des utilisateurs est réservée aux administrateurs.';
    }
    return 'Impossible de charger les utilisateurs. Réessayez plus tard.';
  }
}
