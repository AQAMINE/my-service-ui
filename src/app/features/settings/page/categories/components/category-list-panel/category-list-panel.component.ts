import { Component, input, output } from '@angular/core';
import { Category } from '../../models/category';
import { ViewMode } from '../category-filters-bar/category-filters-bar.component';
import { CategoryItem } from '../category-item/category-item.component';

@Component({
  selector: 'app-category-list-panel',
  standalone: true,
  imports: [CategoryItem],
  templateUrl: './category-list-panel.component.html',
  styleUrl: './category-list-panel.component.scss'
})
export class CategoryListPanel {
  readonly categories = input.required<Category[]>();
  readonly viewMode = input<ViewMode>('list');
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly retry = output<void>();
  readonly deleteClick = output<Category>();
}
