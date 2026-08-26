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
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankCard } from '../../models/bank-card';
import { BankCardService } from '../../services/bank-card.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { extractApiError } from '../../../../core/utils/slugify';

@Component({
  selector: 'app-cm-card-detail-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cm-card-detail-modal.component.html',
  styleUrl: './cm-card-detail-modal.component.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class CmCardDetailModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cardService = inject(BankCardService);
  private readonly notificationService = inject(NotificationService);

  private static readonly DELETE_CONFIRM_PHRASE = 'remove';

  readonly open = input(false);
  readonly card = input<BankCard | null>(null);

  readonly closed = output<void>();
  readonly deleted = output<void>();

  readonly panVisible = signal(false);
  readonly panValue = signal<string | null>(null);
  readonly panLoading = signal(false);

  readonly cvvVisible = signal(false);
  readonly cvvValue = signal<string | null>(null);
  readonly cvvLoading = signal(false);

  readonly pinVisible = signal(false);
  readonly pinValue = signal<string | null>(null);
  readonly pinLoading = signal(false);

  readonly copiedField = signal<'pan' | 'cvv' | 'pin' | null>(null);
  readonly bankLogoFailed = signal(false);
  readonly providerLogoFailed = signal(false);

  readonly deleteConfirmOpen = signal(false);
  readonly deleteConfirmInput = signal('');
  readonly deleteLoading = signal(false);
  readonly deleteError = signal<string | null>(null);

  readonly confirmationPhrase = CmCardDetailModal.DELETE_CONFIRM_PHRASE;
  readonly canConfirmDelete = computed(
    () => this.deleteConfirmInput().trim() === this.confirmationPhrase
  );

  readonly surfaceColor = computed(
    () => this.card()?.cardColor || this.card()?.bank.primaryColor || '#1A1A1A'
  );

  readonly maskedPan = computed(() => {
    const last4 = this.card()?.lastFourDigits ?? '••••';
    return `•••• •••• •••• ${last4}`;
  });

  readonly displayPan = computed(() => {
    if (this.panVisible() && this.panValue()) {
      return this.formatPan(this.panValue()!);
    }
    return this.maskedPan();
  });

  readonly displayCvv = computed(() => {
    if (this.cvvVisible() && this.cvvValue()) {
      return this.cvvValue()!;
    }
    return '•••';
  });

  readonly displayPin = computed(() => {
    if (this.pinVisible() && this.pinValue()) {
      return this.pinValue()!;
    }
    return '••••';
  });

  readonly expiryLabel = computed(() => {
    const card = this.card();
    if (!card) {
      return '--/--';
    }
    const month = String(card.expiryMonth).padStart(2, '0');
    const year = String(card.expiryYear).slice(-2);
    return `${month}/${year}`;
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.document.body.style.overflow = isOpen ? 'hidden' : '';
      if (!isOpen) {
        this.clearSecrets();
        this.resetDeleteState();
        this.bankLogoFailed.set(false);
        this.providerLogoFailed.set(false);
        this.copiedField.set(null);
      }
    });

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !this.open()) {
        return;
      }
      if (this.deleteConfirmOpen()) {
        this.cancelDeleteConfirm();
        return;
      }
      this.closed.emit();
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

  onBankLogoError(): void {
    this.bankLogoFailed.set(true);
  }

  onProviderLogoError(): void {
    this.providerLogoFailed.set(true);
  }

  togglePan(): void {
    if (this.panLoading()) {
      return;
    }

    if (this.panVisible() && this.panValue()) {
      this.clearPan();
      return;
    }

    this.fetchPan({ reveal: true });
  }

  toggleCvv(): void {
    if (this.cvvLoading()) {
      return;
    }

    if (this.cvvVisible() && this.cvvValue()) {
      this.clearCvv();
      return;
    }

    this.fetchCvv({ reveal: true });
  }

  copyPan(): void {
    if (this.panLoading()) {
      return;
    }

    const existing = this.panValue();
    if (existing) {
      void this.copyAndDestroy('pan', existing);
      return;
    }

    this.fetchPan({ reveal: false, copyAfterLoad: true });
  }

  copyCvv(): void {
    if (this.cvvLoading()) {
      return;
    }

    const existing = this.cvvValue();
    if (existing) {
      void this.copyAndDestroy('cvv', existing);
      return;
    }

    this.fetchCvv({ reveal: false, copyAfterLoad: true });
  }

  togglePin(): void {
    if (this.pinLoading()) {
      return;
    }

    if (this.pinVisible() && this.pinValue()) {
      this.clearPin();
      return;
    }

    this.fetchPin({ reveal: true });
  }

  copyPin(): void {
    if (this.pinLoading()) {
      return;
    }

    const existing = this.pinValue();
    if (existing) {
      void this.copyAndDestroy('pin', existing);
      return;
    }

    this.fetchPin({ reveal: false, copyAfterLoad: true });
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

    const card = this.card();
    if (!card) {
      return;
    }

    this.deleteError.set(null);
    this.deleteLoading.set(true);

    this.cardService.deleteCard(card.id).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.notificationService.showSuccess(
          'Carte supprimée',
          'La carte a été retirée de votre wallet.'
        );
        this.deleted.emit();
      },
      error: (err: unknown) => {
        this.deleteLoading.set(false);
        this.deleteError.set(
          extractApiError(err, 'Impossible de supprimer la carte. Réessayez.')
        );
      }
    });
  }

  private fetchPan(options: { reveal: boolean; copyAfterLoad?: boolean }): void {
    const card = this.card();
    if (!card) {
      return;
    }

    this.panLoading.set(true);
    this.cardService.revealPan(card.id).subscribe({
      next: ({ pan }) => {
        this.panLoading.set(false);
        if (options.copyAfterLoad) {
          void this.copyAndDestroy('pan', pan);
          return;
        }
        if (options.reveal) {
          this.panValue.set(pan);
          this.panVisible.set(true);
        }
      },
      error: (err: unknown) => {
        this.panLoading.set(false);
        this.notificationService.showError(
          'PAN indisponible',
          extractApiError(err, 'Impossible de révéler le numéro de carte.')
        );
      }
    });
  }

  private fetchCvv(options: { reveal: boolean; copyAfterLoad?: boolean }): void {
    const card = this.card();
    if (!card) {
      return;
    }

    this.cvvLoading.set(true);
    this.cardService.revealCvv(card.id).subscribe({
      next: ({ cvv }) => {
        this.cvvLoading.set(false);
        if (options.copyAfterLoad) {
          void this.copyAndDestroy('cvv', cvv);
          return;
        }
        if (options.reveal) {
          this.cvvValue.set(cvv);
          this.cvvVisible.set(true);
        }
      },
      error: (err: unknown) => {
        this.cvvLoading.set(false);
        this.notificationService.showError(
          'CVV indisponible',
          extractApiError(err, 'Impossible de révéler le CVV.')
        );
      }
    });
  }

  private fetchPin(options: { reveal: boolean; copyAfterLoad?: boolean }): void {
    const card = this.card();
    if (!card) {
      return;
    }

    this.pinLoading.set(true);
    this.cardService.revealPin(card.id).subscribe({
      next: ({ pin }) => {
        this.pinLoading.set(false);
        if (options.copyAfterLoad) {
          void this.copyAndDestroy('pin', pin);
          return;
        }
        if (options.reveal) {
          this.pinValue.set(pin);
          this.pinVisible.set(true);
        }
      },
      error: (err: unknown) => {
        this.pinLoading.set(false);
        this.notificationService.showError(
          'PIN indisponible',
          extractApiError(err, 'Impossible de révéler le PIN.')
        );
      }
    });
  }

  private async copyAndDestroy(field: 'pan' | 'cvv' | 'pin', value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copiedField.set(field);
      window.setTimeout(() => {
        if (this.copiedField() === field) {
          this.copiedField.set(null);
        }
      }, 1400);
      const titles = { pan: 'PAN copié', cvv: 'CVV copié', pin: 'PIN copié' } as const;
      this.notificationService.showSuccess(
        titles[field],
        "La valeur a été copiée puis effacée de l'écran."
      );
    } catch {
      this.notificationService.showError(
        'Copie impossible',
        'Le presse-papiers est indisponible.'
      );
    } finally {
      if (field === 'pan') {
        this.clearPan();
      } else if (field === 'cvv') {
        this.clearCvv();
      } else {
        this.clearPin();
      }
    }
  }

  private clearSecrets(): void {
    this.clearPan();
    this.clearCvv();
    this.clearPin();
  }

  private clearPan(): void {
    this.panValue.set(null);
    this.panVisible.set(false);
    this.panLoading.set(false);
  }

  private clearCvv(): void {
    this.cvvValue.set(null);
    this.cvvVisible.set(false);
    this.cvvLoading.set(false);
  }

  private clearPin(): void {
    this.pinValue.set(null);
    this.pinVisible.set(false);
    this.pinLoading.set(false);
  }

  private resetDeleteState(): void {
    this.deleteConfirmOpen.set(false);
    this.deleteConfirmInput.set('');
    this.deleteLoading.set(false);
    this.deleteError.set(null);
  }

  private formatPan(pan: string): string {
    const digits = pan.replace(/\D/g, '');
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }
}
