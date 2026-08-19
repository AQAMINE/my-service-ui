import {
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchableSelectOption } from '../../models/external-account';

@Component({
  selector: 'app-pm-searchable-select',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pm-searchable-select.component.html',
  styleUrl: './pm-searchable-select.component.scss'
})
export class PmSearchableSelect {
  readonly label = input.required<string>();
  readonly placeholder = input('Sélectionner...');
  readonly options = input.required<SearchableSelectOption[]>();
  readonly value = input<string | null>(null);
  readonly showLogos = input(false);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly valueChange = output<string | null>();
  readonly touched = output<void>();

  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly open = signal(false);
  readonly query = signal('');
  readonly highlightIndex = signal(0);
  readonly logoFailedIds = signal<Set<string>>(new Set());

  readonly selectedOption = computed(() => {
    const id = this.value();
    if (!id) {
      return null;
    }
    return this.options().find((option) => option.id === id) ?? null;
  });

  readonly filteredOptions = computed(() => {
    const q = this.query().trim().toLowerCase();
    const options = this.options();
    if (!q) {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(q));
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const el = this.root()?.nativeElement;
    if (!el || !this.open()) {
      return;
    }
    if (!el.contains(event.target as Node)) {
      this.close();
    }
  }

  toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.close();
      return;
    }
    this.openDropdown();
  }

  openDropdown(): void {
    if (this.disabled()) {
      return;
    }
    this.open.set(true);
    this.query.set('');
    this.syncHighlight();
    queueMicrotask(() => this.searchInput()?.nativeElement.focus());
  }

  close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.query.set('');
    this.touched.emit();
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.highlightIndex.set(0);
  }

  selectOption(option: SearchableSelectOption): void {
    this.valueChange.emit(option.id);
    this.open.set(false);
    this.query.set('');
    this.touched.emit();
  }

  clear(event: Event): void {
    event.stopPropagation();
    if (this.disabled()) {
      return;
    }
    this.valueChange.emit(null);
    this.touched.emit();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openDropdown();
    }
  }

  onListKeydown(event: KeyboardEvent): void {
    const filtered = this.filteredOptions();
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!filtered.length) {
        return;
      }
      this.highlightIndex.update((i) => (i + 1) % filtered.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!filtered.length) {
        return;
      }
      this.highlightIndex.update((i) => (i - 1 + filtered.length) % filtered.length);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[this.highlightIndex()];
      if (option) {
        this.selectOption(option);
      }
    }
  }

  onLogoError(id: string): void {
    this.logoFailedIds.update((set) => {
      const next = new Set(set);
      next.add(id);
      return next;
    });
  }

  showLogo(option: SearchableSelectOption): boolean {
    return !!option.logoUrl && !this.logoFailedIds().has(option.id);
  }

  initials(label: string): string {
    const parts = label.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  private syncHighlight(): void {
    const selectedId = this.value();
    const filtered = this.filteredOptions();
    const index = selectedId ? filtered.findIndex((o) => o.id === selectedId) : 0;
    this.highlightIndex.set(index >= 0 ? index : 0);
  }
}
