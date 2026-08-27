import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeader {
  readonly title = input('Administration');
  readonly back = output<void>();
}
