import { Component, input, output } from '@angular/core';
import { ExternalAccount, ViewMode } from '../../models/external-account';
import { PmAccountItem } from '../pm-account-item/pm-account-item.component';

@Component({
  selector: 'app-pm-accounts-panel',
  standalone: true,
  imports: [PmAccountItem],
  templateUrl: './pm-accounts-panel.component.html',
  styleUrl: './pm-accounts-panel.component.scss'
})
export class PmAccountsPanel {
  readonly accounts = input.required<ExternalAccount[]>();
  readonly viewMode = input<ViewMode>('list');
  readonly accountSelected = output<string>();
}
