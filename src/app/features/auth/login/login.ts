import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

const REMEMBERED_USERNAME_KEY = 'remembered_username';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const remembered = localStorage.getItem(REMEMBERED_USERNAME_KEY);
    if (remembered) {
      this.loginForm.patchValue({
        username: remembered,
        rememberMe: true
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password, rememberMe } = this.loginForm.getRawValue();

    this.authService.login({
      username: username!,
      password: password!
    }).subscribe({
      next: () => {
        if (isPlatformBrowser(this.platformId)) {
          if (rememberMe) {
            localStorage.setItem(REMEMBERED_USERNAME_KEY, username!);
          } else {
            localStorage.removeItem(REMEMBERED_USERNAME_KEY);
          }
        }

        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Invalid email or password.');
        } else {
          this.errorMessage.set('Unable to reach the server. Please try again.');
        }
      }
    });
  }
}
