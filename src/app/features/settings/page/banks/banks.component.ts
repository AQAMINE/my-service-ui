import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Bank } from './models/bank';
import { BankService } from './services/bank.service';
import {
  BankFiltersBar,
  BankSortField,
  SortDirection,
  ViewMode
} from './components/bank-filters-bar/bank-filters-bar.component';
import { BankListPanel } from './components/bank-list-panel/bank-list-panel.component';
import { CreateBankModal } from './components/create-bank-modal/create-bank-modal.component';
import { DeleteBankModal } from './components/delete-bank-modal/delete-bank-modal.component';

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [BankFiltersBar, BankListPanel, CreateBankModal, DeleteBankModal],
  templateUrl: './banks.component.html',
  styleUrl: './banks.component.scss'
})
export class Banks implements OnInit {
  private bankService = inject(BankService);
  private platformId = inject(PLATFORM_ID);

  private readonly banks = signal<Bank[]>([]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  readonly sortField = signal<BankSortField>('name');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly viewMode = signal<ViewMode>('list');
  readonly isCreateOpen = signal(false);
  readonly deleteTarget = signal<Bank | null>(null);

  readonly filteredBanks = computed(() => {
    const query = this.search().trim().toLowerCase();
    const sortField = this.sortField();
    const sortDirection = this.sortDirection();

    let result = this.banks().filter((bank) => {
      if (!query) {
        return true;
      }
      return [bank.name, bank.code, bank.websiteUrl ?? '']
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
    this.loadBanks();
  }

  loadBanks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.bankService.getBanks().subscribe({
      next: (banks) => {
        this.banks.set(banks);
        this.isLoading.set(false);
      },
      error: () => {
        this.banks.set([]);
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les banques. Réessayez plus tard.');
      }
    });
  }

  onCreated(): void {
    this.isCreateOpen.set(false);
    this.loadBanks();
  }

  onDeleted(): void {
    this.deleteTarget.set(null);
    this.loadBanks();
  }
}
