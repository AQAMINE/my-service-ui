import { Component, input, output } from '@angular/core';
import { Category } from '../../models/category';
import { ViewMode } from '../category-filters-bar/category-filters-bar';
import { CategoryItem } from '../category-item/category-item';

@Component({
  selector: 'app-category-list-panel',
  standalone: true,
  imports: [CategoryItem],
  templateUrl: './category-list-panel.html',
  styleUrl: './category-list-panel.scss'
})
export class CategoryListPanel {
  readonly categories = input.required<Category[]>();
  readonly viewMode = input<ViewMode>('list');
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly retry = output<void>();
  readonly deleteClick = output<Category>();
}
