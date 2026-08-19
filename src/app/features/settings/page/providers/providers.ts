import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Provider } from './models/provider';
import { ProviderService } from './services/provider.service';
import {
  ProviderFiltersBar,
  ProviderSortField,
  SortDirection,
  ViewMode
} from './components/provider-filters-bar/provider-filters-bar';
import { ProviderListPanel } from './components/provider-list-panel/provider-list-panel';
import { CreateProviderModal } from './components/create-provider-modal/create-provider-modal';
import { DeleteProviderModal } from './components/delete-provider-modal/delete-provider-modal';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [ProviderFiltersBar, ProviderListPanel, CreateProviderModal, DeleteProviderModal],
  templateUrl: './providers.html',
  styleUrl: './providers.scss'
})
export class Providers implements OnInit {
  private providerService = inject(ProviderService);
  private platformId = inject(PLATFORM_ID);

  private readonly providers = signal<Provider[]>([]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  readonly sortField = signal<ProviderSortField>('name');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly viewMode = signal<ViewMode>('list');
  readonly isCreateOpen = signal(false);
  readonly deleteTarget = signal<Provider | null>(null);

  readonly filteredProviders = computed(() => {
    const query = this.search().trim().toLowerCase();
    const sortField = this.sortField();
    const sortDirection = this.sortDirection();

    let result = this.providers().filter((provider) => {
      if (!query) {
        return true;
      }
      return [provider.name, provider.slug, provider.websiteUrl ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query);
    });

    result = [...result].sort((a, b) => {
      if (sortField === 'name') {
        const cmp = a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? left - right : right - left;
    });

    return result;
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }
    this.loadProviders();
  }

  loadProviders(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.providerService.getProviders().subscribe({
      next: (providers) => {
        this.providers.set(providers);
        this.isLoading.set(false);
      },
      error: () => {
        this.providers.set([]);
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les providers. Réessayez plus tard.');
      }
    });
  }

  onCreated(): void {
    this.isCreateOpen.set(false);
    this.loadProviders();
  }

  onDeleted(): void {
    this.deleteTarget.set(null);
    this.loadProviders();
  }
}
