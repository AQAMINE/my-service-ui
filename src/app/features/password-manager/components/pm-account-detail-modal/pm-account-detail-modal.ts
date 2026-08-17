import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { ExternalAccount } from '../../models/external-account';

@Component({
  selector: 'app-pm-account-detail-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './pm-account-detail-modal.html',
  styleUrl: './pm-account-detail-modal.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class PmAccountDetailModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly account = input<ExternalAccount | null>(null);
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly retry = output<void>();

  readonly passwordVisible = signal(false);
  readonly copiedField = signal<string | null>(null);
  readonly logoFailed = signal(false);

  private readonly passwordValue = signal<string | null>(null);

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.document.body.style.overflow = isOpen ? 'hidden' : '';
      if (!isOpen) {
        this.passwordVisible.set(false);
        this.copiedField.set(null);
        this.passwordValue.set(null);
        this.logoFailed.set(false);
      }
    });

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.open()) {
        this.closed.emit();
      }
    };
    this.document.addEventListener('keydown', onKeydown);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('keydown', onKeydown);
      this.document.body.style.overflow = '';
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  onLogoError(): void {
    this.logoFailed.set(true);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  async copyValue(field: string, value: string | null | undefined): Promise<void> {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      this.copiedField.set(field);
      window.setTimeout(() => {
        if (this.copiedField() === field) {
          this.copiedField.set(null);
        }
      }, 1400);
    } catch {
      // Clipboard may be unavailable; ignore silently.
    }
  }

  copyPassword(): void {
    void this.copyValue('password', this.passwordValue());
  }

  displayPassword(): string {
    if (!this.passwordVisible()) {
      return '••••••••';
    }
    return this.passwordValue() ?? 'Non chargé';
  }

  providerInitials(account: ExternalAccount): string {
    return account.provider.name.trim().slice(0, 2).toUpperCase();
  }
}
