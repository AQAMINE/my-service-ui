import { Component, input } from '@angular/core';
import { StatusCount } from '../../models/task';

@Component({
  selector: 'app-tm-stats-panel',
  standalone: true,
  templateUrl: './tm-stats-panel.component.html',
  styleUrl: './tm-stats-panel.component.scss'
})
export class TmStatsPanel {
  readonly total = input(0);
  readonly overdue = input(0);
  readonly statuses = input.required<StatusCount[]>();
}
