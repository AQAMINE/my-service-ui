import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-manager',
  standalone: true,
  templateUrl: './password-manager.html',
  styleUrl: './password-manager.scss'
})
export class PasswordManager {
  private router = inject(Router);

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
