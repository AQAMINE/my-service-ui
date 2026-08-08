import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Signals pour gérer l'état UI
  apiResponse = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.testPrivateEndpoint();
  }

  /**
   * Effectue un GET sur l'endpoint privé.
   * L'intercepteur JWT ajoutera automatiquement le header Authorization.
   */
  testPrivateEndpoint(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.get(`${environment.apiUrl}/private/hello`, { responseType: 'text' }).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.apiResponse.set(data);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Erreur lors de l\'appel de l\'endpoint privé:', err);
        if (err.status === 401) {
          this.errorMessage.set('Non autorisé (401) : Token invalide ou expiré.');
        } else if (err.status === 403) {
          this.errorMessage.set('Accès interdit (403) : Rôles insuffisants.');
        } else {
          this.errorMessage.set(`Erreur serveur (${err.status}) ou problème CORS.`);
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}