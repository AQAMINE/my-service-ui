import { Injectable, signal } from '@angular/core';
import { AppNotification, ShowNotificationOptions } from '../models/notification';

const DEFAULT_DURATION_MS = 4500;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly _notification = signal<AppNotification | null>(null);
  readonly notification = this._notification.asReadonly();

  show(options: ShowNotificationOptions): void {
    this.clearTimer();

    const entry: AppNotification = {
      id: crypto.randomUUID(),
      autoDismiss: options.autoDismiss ?? options.type !== 'error',
      durationMs: options.durationMs ?? DEFAULT_DURATION_MS,
      ...options
    };

    this._notification.set(entry);

    if (entry.autoDismiss) {
      this.dismissTimer = setTimeout(() => this.dismiss(), entry.durationMs);
    }
  }

  showSuccess(title: string, detail: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show({ type: 'success', title, detail, autoDismiss: true, durationMs });
  }

  showWarning(title: string, detail: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show({ type: 'warning', title, detail, autoDismiss: true, durationMs });
  }

  showError(title: string, detail: string): void {
    this.show({ type: 'error', title, detail, autoDismiss: false });
  }

  dismiss(): void {
    this.clearTimer();
    this._notification.set(null);
  }

  private clearTimer(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
}
