import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { AppTile } from '../../shared/components/app-tile/app-tile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AppTile],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
