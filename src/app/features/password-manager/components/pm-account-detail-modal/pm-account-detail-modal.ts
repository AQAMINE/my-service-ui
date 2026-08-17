import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExternalAccount } from '../../models/external-account';
import { ExternalAccountService } from '../../services/external-account.service';

@Component({
  selector: 'app-pm-account-detail-modal',
  standalone: true,
  imports: [DatePipe, FormsModule],
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
  private readonly accountService = inject(ExternalAccountService);

  readonly open = input(false);
  readonly account = input<ExternalAccount | null>(null);
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly retry = output<void>();
  readonly deleted = output<void>();

  readonly passwordVisible = signal(false);
  readonly passwordLoading = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordValue = signal<string | null>(null);
  readonly copiedField = signal<string | null>(null);
  readonly logoFailed = signal(false);

  readonly deleteConfirmOpen = signal(false);
  readonly deleteConfirmInput = signal('');
  readonly deleteLoading = signal(false);
  readonly deleteError = signal<string | null>(null);

  readonly confirmationPhrase = computed(() => {
    const fullName = this.account()?.fullName?.trim();
    return fullName ? fullName : 'SUPPRIMER';
  });

  readonly canConfirmDelete = computed(
    () => this.deleteConfirmInput() === this.confirmationPhrase()
  );

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.document.body.style.overflow = isOpen ? 'hidden' : '';
      if (!isOpen) {
        this.resetPasswordState();
        this.resetDeleteState();
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
    if (this.passwordLoading()) {
      return;
    }

    if (this.passwordValue() !== null) {
      this.passwordVisible.update((visible) => !visible);
      return;
    }

    this.loadPassword({ reveal: true });
  }

  copyPassword(): void {
    if (this.passwordLoading()) {
      return;
    }

    const existing = this.passwordValue();
    if (existing !== null) {
      void this.copyValue('password', existing);
      return;
    }

    this.loadPassword({ reveal: false, copyAfterLoad: true });
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

  displayPassword(): string {
    if (!this.passwordVisible()) {
      return '••••••••';
    }
    return this.passwordValue() ?? 'Non chargé';
  }

  providerInitials(account: ExternalAccount): string {
    return account.provider.name.trim().slice(0, 2).toUpperCase();
  }

  openDeleteConfirm(): void {
    this.deleteConfirmOpen.set(true);
    this.deleteConfirmInput.set('');
    this.deleteError.set(null);
  }

  cancelDeleteConfirm(): void {
    this.resetDeleteState();
  }

  confirmDelete(): void {
    if (!this.canConfirmDelete() || this.deleteLoading()) {
      return;
    }

    const account = this.account();
    if (!account) {
      return;
    }

    this.deleteError.set(null);
    this.deleteLoading.set(true);

    this.accountService.deleteAccount(account.id).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.deleted.emit();
      },
      error: () => {
        this.deleteLoading.set(false);
        this.deleteError.set('Impossible de supprimer le compte. Réessayez.');
      }
    });
  }

  private loadPassword(options: { reveal: boolean; copyAfterLoad?: boolean }): void {
    const account = this.account();
    if (!account) {
      return;
    }

    this.passwordError.set(null);
    this.passwordLoading.set(true);

    this.accountService.getAccountPassword(account.id).subscribe({
      next: (response) => {
        this.passwordValue.set(response.password);
        this.passwordLoading.set(false);
        if (options.reveal) {
          this.passwordVisible.set(true);
        }
        if (options.copyAfterLoad) {
          void this.copyValue('password', response.password);
        }
      },
      error: () => {
        this.passwordValue.set(null);
        this.passwordVisible.set(false);
        this.passwordLoading.set(false);
        this.passwordError.set('Impossible de charger le mot de passe.');
      }
    });
  }

  private resetPasswordState(): void {
    this.passwordVisible.set(false);
    this.passwordLoading.set(false);
    this.passwordError.set(null);
    this.passwordValue.set(null);
    this.copiedField.set(null);
  }

  private resetDeleteState(): void {
    this.deleteConfirmOpen.set(false);
    this.deleteConfirmInput.set('');
    this.deleteLoading.set(false);
    this.deleteError.set(null);
  }
}
