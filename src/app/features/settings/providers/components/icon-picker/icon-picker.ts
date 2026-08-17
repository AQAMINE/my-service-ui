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
import {
  SIMPLE_ICONS_CATALOG,
  SIMPLE_ICONS_COUNT
} from '../../../../../core/data/simple-icons.catalog';
import { SimpleIconOption } from '../../../../../core/models/provider';
import { simpleIconUrl } from '../../../../../core/utils/slugify';

const PAGE_SIZE = 72;

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './icon-picker.html',
  styleUrl: './icon-picker.scss'
})
export class IconPicker {
  readonly label = input('Icône');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly value = input<string | null>(null);
  readonly previewColor = input('#00ABE4');

  readonly valueChange = output<SimpleIconOption>();
  readonly touched = output<void>();

  readonly catalogSize = SIMPLE_ICONS_COUNT;

  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly open = signal(false);
  readonly query = signal('');
  readonly highlightIndex = signal(0);
  readonly visibleCount = signal(PAGE_SIZE);
  readonly failedSlugs = signal<Set<string>>(new Set());

  readonly selected = computed(() => {
    const slug = this.value();
    if (!slug) {
      return null;
    }
    return SIMPLE_ICONS_CATALOG.find((icon) => icon.slug === slug) ?? null;
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return SIMPLE_ICONS_CATALOG;
    }
    return SIMPLE_ICONS_CATALOG.filter((icon) => this.matches(icon, q));
  });

  readonly visible = computed(() => this.filtered().slice(0, this.visibleCount()));

  readonly remainingCount = computed(
    () => Math.max(0, this.filtered().length - this.visible().length)
  );

  iconUrl(icon: SimpleIconOption, color?: string): string {
    return simpleIconUrl(icon.slug, color ?? icon.defaultColor);
  }

  showImage(slug: string): boolean {
    return !this.failedSlugs().has(slug);
  }

  onImageError(slug: string): void {
    this.failedSlugs.update((set) => {
      const next = new Set(set);
      next.add(slug);
      return next;
    });
  }

  initials(label: string): string {
    return label.slice(0, 2).toUpperCase();
  }

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
    this.open.set(true);
    this.query.set('');
    this.visibleCount.set(PAGE_SIZE);
    this.syncHighlight();
    queueMicrotask(() => this.searchInput()?.nativeElement.focus());
  }

  close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.query.set('');
    this.visibleCount.set(PAGE_SIZE);
    this.touched.emit();
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.visibleCount.set(PAGE_SIZE);
    this.highlightIndex.set(0);
  }

  loadMore(): void {
    this.visibleCount.update((count) => count + PAGE_SIZE);
  }

  select(icon: SimpleIconOption): void {
    this.valueChange.emit(icon);
    this.open.set(false);
    this.query.set('');
    this.visibleCount.set(PAGE_SIZE);
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
    const visible = this.visible();
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (visible.length) {
        this.highlightIndex.update((i) => (i + 1) % visible.length);
      }
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (visible.length) {
        this.highlightIndex.update((i) => (i - 1 + visible.length) % visible.length);
      }
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const icon = visible[this.highlightIndex()];
      if (icon) {
        this.select(icon);
      }
    }
  }

  private matches(icon: SimpleIconOption, query: string): boolean {
    if (icon.label.toLowerCase().includes(query) || icon.slug.toLowerCase().includes(query)) {
      return true;
    }
    return icon.aliases?.some((alias) => alias.toLowerCase().includes(query)) ?? false;
  }

  private syncHighlight(): void {
    const selectedId = this.value();
    const visible = this.visible();
    const index = selectedId ? visible.findIndex((icon) => icon.slug === selectedId) : 0;
    this.highlightIndex.set(index >= 0 ? index : 0);
  }
}
