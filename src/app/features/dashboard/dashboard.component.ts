import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AppTile } from '../../shared/components/app-tile/app-tile.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AppTile],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);

  openPasswordManager(): void {
    this.router.navigate(['/password-manager']);
  }

  openSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.logout();
  }
}
