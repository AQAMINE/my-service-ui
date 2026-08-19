import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Category } from './models/category';
import { CategoryService } from './services/category.service';
import {
  CategoryFiltersBar,
  CategorySortField,
  SortDirection,
  ViewMode
} from './components/category-filters-bar/category-filters-bar';
import { CategoryListPanel } from './components/category-list-panel/category-list-panel';
import { CreateCategoryModal } from './components/create-category-modal/create-category-modal';
import { DeleteCategoryModal } from './components/delete-category-modal/delete-category-modal';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CategoryFiltersBar, CategoryListPanel, CreateCategoryModal, DeleteCategoryModal],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class Categories implements OnInit {
  private categoryService = inject(CategoryService);
  private platformId = inject(PLATFORM_ID);

  private readonly categories = signal<Category[]>([]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  readonly sortField = signal<CategorySortField>('name');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly viewMode = signal<ViewMode>('list');
  readonly isCreateOpen = signal(false);
  readonly deleteTarget = signal<Category | null>(null);

  readonly filteredCategories = computed(() => {
    const query = this.search().trim().toLowerCase();
    const sortField = this.sortField();
    const sortDirection = this.sortDirection();

    let result = this.categories().filter((category) => {
      if (!query) {
        return true;
      }
      return [category.name, category.slug, category.description ?? '']
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
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: () => {
        this.categories.set([]);
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les catégories. Réessayez plus tard.');
      }
    });
  }

  onCreated(): void {
    this.isCreateOpen.set(false);
    this.loadCategories();
  }

  onDeleted(): void {
    this.deleteTarget.set(null);
    this.loadCategories();
  }
}
