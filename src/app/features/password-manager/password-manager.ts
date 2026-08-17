import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  CategorySummary,
  ExternalAccount,
  ProviderSummary,
  RankedStat,
  SortDirection,
  SortField,
  ViewMode
} from './models/external-account';
import { ExternalAccountService } from './services/external-account.service';
import { PmStatsPanel } from './components/pm-stats-panel/pm-stats-panel';
import { PmFiltersBar } from './components/pm-filters-bar/pm-filters-bar';
import { PmAccountsPanel } from './components/pm-accounts-panel/pm-accounts-panel';
import { PmAccountDetailModal } from './components/pm-account-detail-modal/pm-account-detail-modal';
import { PmCreateAccountModal } from './components/pm-create-account-modal/pm-create-account-modal';

@Component({
  selector: 'app-password-manager',
  standalone: true,
  imports: [
    PmStatsPanel,
    PmFiltersBar,
    PmAccountsPanel,
    PmAccountDetailModal,
    PmCreateAccountModal
  ],
  templateUrl: './password-manager.html',
  styleUrl: './password-manager.scss'
})
export class PasswordManager implements OnInit {
  private router = inject(Router);
  private accountService = inject(ExternalAccountService);
  private platformId = inject(PLATFORM_ID);

  private readonly accounts = signal<ExternalAccount[]>([]);
  private selectedDetailId: string | null = null;

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly isCreateOpen = signal(false);

  readonly isDetailOpen = signal(false);
  readonly detailAccount = signal<ExternalAccount | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);

  readonly search = signal('');
  readonly categoryId = signal('');
  readonly providerId = signal('');
  readonly sortField = signal<SortField>('updatedAt');
  readonly sortDirection = signal<SortDirection>('desc');
  readonly viewMode = signal<ViewMode>('list');

  readonly categories = computed<CategorySummary[]>(() => {
    const map = new Map<string, CategorySummary>();
    for (const account of this.accounts()) {
      map.set(account.category.id, account.category);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly providers = computed<ProviderSummary[]>(() => {
    const map = new Map<string, ProviderSummary>();
    for (const account of this.accounts()) {
      map.set(account.provider.id, account.provider);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly topCategories = computed<RankedStat[]>(() => {
    const counts = new Map<string, RankedStat>();
    for (const account of this.accounts()) {
      const current = counts.get(account.category.id);
      if (current) {
        current.count += 1;
      } else {
        counts.set(account.category.id, {
          id: account.category.id,
          name: account.category.name,
          count: 1
        });
      }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 3);
  });

  readonly topProviders = computed<RankedStat[]>(() => {
    const counts = new Map<string, RankedStat>();
    for (const account of this.accounts()) {
      const current = counts.get(account.provider.id);
      if (current) {
        current.count += 1;
      } else {
        counts.set(account.provider.id, {
          id: account.provider.id,
          name: account.provider.name,
          count: 1,
          logoUrl: account.provider.logoUrl,
          color: account.provider.color
        });
      }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 3);
  });

  readonly filteredAccounts = computed(() => {
    const query = this.search().trim().toLowerCase();
    const categoryId = this.categoryId();
    const providerId = this.providerId();
    const sortField = this.sortField();
    const sortDirection = this.sortDirection();

    let result = this.accounts().filter((account) => {
      if (categoryId && account.category.id !== categoryId) {
        return false;
      }
      if (providerId && account.provider.id !== providerId) {
        return false;
      }
      if (!query) {
        return true;
      }

      const haystack = [
        account.fullName,
        account.username,
        account.email,
        account.category.name,
        account.provider.name
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    result = [...result].sort((a, b) => {
      const left = new Date(a[sortField]).getTime();
      const right = new Date(b[sortField]).getTime();
      return sortDirection === 'asc' ? left - right : right - left;
    });

    return result;
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.isLoading.set(false);
      },
      error: () => {
        this.accounts.set([]);
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les comptes. Réessayez plus tard.');
      }
    });
  }

  openAccountDetail(id: string): void {
    this.selectedDetailId = id;
    this.isDetailOpen.set(true);
    this.detailAccount.set(null);
    this.detailError.set(null);
    this.detailLoading.set(true);
    this.fetchAccountDetail(id);
  }

  retryAccountDetail(): void {
    if (!this.selectedDetailId) {
      return;
    }
    this.detailError.set(null);
    this.detailLoading.set(true);
    this.fetchAccountDetail(this.selectedDetailId);
  }

  closeAccountDetail(): void {
    this.isDetailOpen.set(false);
    this.detailAccount.set(null);
    this.detailError.set(null);
    this.detailLoading.set(false);
    this.selectedDetailId = null;
  }

  onAccountDeleted(): void {
    this.closeAccountDetail();
    this.loadAccounts();
  }

  openCreateAccount(): void {
    this.isCreateOpen.set(true);
  }

  closeCreateAccount(): void {
    this.isCreateOpen.set(false);
  }

  onAccountCreated(): void {
    this.closeCreateAccount();
    this.loadAccounts();
  }

  private fetchAccountDetail(id: string): void {
    this.accountService.getAccountById(id).subscribe({
      next: (account) => {
        if (this.selectedDetailId !== id) {
          return;
        }
        this.detailAccount.set(account);
        this.detailLoading.set(false);
      },
      error: () => {
        if (this.selectedDetailId !== id) {
          return;
        }
        this.detailAccount.set(null);
        this.detailLoading.set(false);
        this.detailError.set('Impossible de charger le détail du compte.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
