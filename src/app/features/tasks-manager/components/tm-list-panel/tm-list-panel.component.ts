import { Component, input, output } from '@angular/core';
import { Task, dueLabel, formatDateTime, isOverdue, statusColor, textOn } from '../../models/task';

@Component({
  selector: 'app-tm-list-panel',
  standalone: true,
  templateUrl: './tm-list-panel.component.html',
  styleUrl: './tm-list-panel.component.scss'
})
export class TmListPanel {
  readonly tasks = input.required<Task[]>();
  readonly emptyMessage = input('Aucune tâche ne correspond à ces filtres.');
  readonly taskOpen = output<string>();

  readonly dueLabel = dueLabel;
  readonly formatDateTime = formatDateTime;
  readonly isOverdue = isOverdue;
  readonly statusColor = statusColor;
  readonly textOn = textOn;
}
