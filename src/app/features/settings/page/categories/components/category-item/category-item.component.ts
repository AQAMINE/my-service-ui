import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Category } from '../../models/category';
import { ViewMode } from '../category-filters-bar/category-filters-bar.component';

@Component({
  selector: 'app-category-item',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './category-item.component.html',
  styleUrl: './category-item.component.scss',
  host: {
    '[class.is-grid]': 'viewMode() === "grid"',
    '[class.is-list]': 'viewMode() === "list"'
  }
})
export class CategoryItem {
  readonly category = input.required<Category>();
  readonly viewMode = input<ViewMode>('list');

  readonly deleteClick = output<Category>();

  readonly isSystem = computed(() => this.category().userId === null);

  onDelete(event: Event): void {
    event.stopPropagation();
    if (this.isSystem()) {
      return;
    }
    this.deleteClick.emit(this.category());
  }
}
