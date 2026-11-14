import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SortDirection,
  TaskPriority,
  TaskSortField,
  TaskStatus,
  TaskViewMode
} from '../../models/task';

@Component({
  selector: 'app-tm-filters-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tm-filters-bar.component.html',
  styleUrl: './tm-filters-bar.component.scss'
})
export class TmFiltersBar {
  readonly search = input('');
  readonly statusId = input('');
  readonly priorityId = input('');
  readonly sortField = input<TaskSortField>('dueDate');
  readonly sortDirection = input<SortDirection>('asc');
  readonly viewMode = input<TaskViewMode>('kanban');
  readonly statuses = input.required<TaskStatus[]>();
  readonly priorities = input.required<TaskPriority[]>();

  readonly searchChange = output<string>();
  readonly statusIdChange = output<string>();
  readonly priorityIdChange = output<string>();
  readonly sortFieldChange = output<TaskSortField>();
  readonly sortDirectionChange = output<SortDirection>();
  readonly viewModeChange = output<TaskViewMode>();
  readonly createClick = output<void>();
  readonly metadataClick = output<void>();
}
