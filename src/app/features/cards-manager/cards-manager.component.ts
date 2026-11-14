import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  BankCard,
  BankSummary,
  CardProviderSummary,
  SortDirection,
  SortField,
  ViewMode
} from './models/bank-card';
import { BankCardService } from './services/bank-card.service';
import { CmFiltersBar } from './components/cm-filters-bar/cm-filters-bar.component';
import { CmCardsPanel } from './components/cm-cards-panel/cm-cards-panel.component';
import { CmCardDetailModal } from './components/cm-card-detail-modal/cm-card-detail-modal.component';
import { CmCreateCardModal } from './components/cm-create-card-modal/cm-create-card-modal.component';

@Component({
  selector: 'app-cards-manager',
  standalone: true,
  imports: [CmFiltersBar, CmCardsPanel, CmCardDetailModal, CmCreateCardModal],
  templateUrl: './cards-manager.component.html',
  styleUrl: './cards-manager.component.scss'
})
export class CardsManager implements OnInit {
  private router = inject(Router);
  private cardService = inject(BankCardService);
  private platformId = inject(PLATFORM_ID);

  private readonly cards = signal<BankCard[]>([]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly search = signal('');
  readonly bankId = signal('');
  readonly providerId = signal('');
  readonly sortField = signal<SortField>('updatedAt');
  readonly sortDirection = signal<SortDirection>('desc');
  readonly viewMode = signal<ViewMode>('grid');

  readonly isDetailOpen = signal(false);
  readonly detailCard = signal<BankCard | null>(null);
  readonly isCreateOpen = signal(false);

  readonly banks = computed<BankSummary[]>(() => {
    const map = new Map<string, BankSummary>();
    for (const card of this.cards()) {
      map.set(card.bank.id, card.bank);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly providers = computed<CardProviderSummary[]>(() => {
    const map = new Map<string, CardProviderSummary>();
    for (const card of this.cards()) {
      map.set(card.provider.id, card.provider);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly filteredCards = computed(() => {
    const query = this.search().trim().toLowerCase();
    const bankId = this.bankId();
    const providerId = this.providerId();
    const sortField = this.sortField();
    const sortDirection = this.sortDirection();

    let result = this.cards().filter((card) => {
      if (bankId && card.bank.id !== bankId) {
        return false;
      }
      if (providerId && card.provider.id !== providerId) {
        return false;
      }
      if (!query) {
        return true;
      }

      const haystack = [
        card.cardName,
        card.cardHolderName,
        card.lastFourDigits,
        card.bank.name,
        card.bank.code,
        card.provider.name
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'cardName') {
        cmp = a.cardName.localeCompare(b.cardName);
      } else if (sortField === 'bank') {
        cmp = a.bank.name.localeCompare(b.bank.name);
      } else if (sortField === 'expiry') {
        const left = a.expiryYear * 100 + a.expiryMonth;
        const right = b.expiryYear * 100 + b.expiryMonth;
        cmp = left - right;
      } else {
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }
    this.loadCards();
  }

  loadCards(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.cardService.getCards().subscribe({
      next: (cards) => {
        this.cards.set(cards);
        this.isLoading.set(false);
      },
      error: () => {
        this.cards.set([]);
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les cartes. Réessayez plus tard.');
      }
    });
  }

  openCardDetail(id: string): void {
    const card = this.cards().find((item) => item.id === id) ?? null;
    this.detailCard.set(card);
    this.isDetailOpen.set(true);
  }

  closeCardDetail(): void {
    this.isDetailOpen.set(false);
    this.detailCard.set(null);
  }

  openCreateCard(): void {
    this.isCreateOpen.set(true);
  }

  closeCreateCard(): void {
    this.isCreateOpen.set(false);
  }

  onCardCreated(): void {
    this.closeCreateCard();
    this.loadCards();
  }

  onCardDeleted(): void {
    this.closeCardDetail();
    this.loadCards();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
