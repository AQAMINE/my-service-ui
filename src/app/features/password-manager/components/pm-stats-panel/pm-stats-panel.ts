import { Component, input } from '@angular/core';
import { RankedStat } from '../../models/external-account';

@Component({
  selector: 'app-pm-stats-panel',
  standalone: true,
  templateUrl: './pm-stats-panel.html',
  styleUrl: './pm-stats-panel.scss'
})
export class PmStatsPanel {
  readonly topCategories = input.required<RankedStat[]>();
  readonly topProviders = input.required<RankedStat[]>();
}
