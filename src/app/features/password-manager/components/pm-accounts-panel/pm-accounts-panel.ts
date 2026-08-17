import { Component, input, output } from '@angular/core';
import { ExternalAccount, ViewMode } from '../../models/external-account';
import { PmAccountItem } from '../pm-account-item/pm-account-item';

@Component({
  selector: 'app-pm-accounts-panel',
  standalone: true,
  imports: [PmAccountItem],
  templateUrl: './pm-accounts-panel.html',
  styleUrl: './pm-accounts-panel.scss'
})
export class PmAccountsPanel {
  readonly accounts = input.required<ExternalAccount[]>();
  readonly viewMode = input<ViewMode>('list');
  readonly accountSelected = output<string>();
}
