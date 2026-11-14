import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CardProvider, isSystemCardProvider } from './models/card-provider';
import { CardProviderService } from './services/card-provider.service';
import {
  CardProviderSortField,
  CpFiltersBar,
  OriginFilter,
  SortDirection,
  ViewMode
} from './components/cp-filters-bar/cp-filters-bar.component';
import { CpListPanel } from './components/cp-list-panel/cp-list-panel.component';
import { CreateCardProviderModal } from './components/create-card-provider-modal/create-card-provider-modal.component';
import { DeleteCardProviderModal } from './components/delete-card-provider-modal/delete-card-provider-modal.component';

@Component({
  selector: 'app-card-providers',
  standalone: true,
  imports: [CpFiltersBar, CpListPanel, CreateCardProviderModal, DeleteCardProviderModal],
  templateUrl: './card-providers.component.html',
  styleUrl: './card-providers.component.scss'
})
export class CardProviders implements OnInit {
  private providerService = inject(CardProviderService);
  private platformId = inject(PLATFORM_ID);

  private readonly providers = signal<CardProvider[]>([]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  readonly origin = signal<OriginFilter>('all');
  readonly sortField = signal<CardProviderSortField>('name');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly viewMode = signal<ViewMode>('list');
  readonly isCreateOpen = signal(false);
  readonly deleteTarget = signal<CardProvider | null>(null);

  readonly filteredProviders = computed(() => {
    const query = this.search().trim().toLowerCase();
    const origin = this.origin();
    const sortField = this.sortField();
    const sortDirection = this.sortDirection();

    let result = this.providers().filter((provider) => {
      const system = isSystemCardProvider(provider);
      if (origin === 'system' && !system) {
        return false;
      }
      if (origin === 'custom' && system) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [provider.name, provider.code]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });

    result = [...result].sort((a, b) => {
      const left = (sortField === 'code' ? a.code : a.name).toLowerCase();
      const right = (sortField === 'code' ? b.code : b.name).toLowerCase();
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
        this.errorMessage.set('Impossible de charger les réseaux. Réessayez plus tard.');
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
