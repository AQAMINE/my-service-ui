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
import { Bank } from '../../models/bank';
import { BankService } from '../../services/bank.service';
import { extractApiError } from '../../../../../../core/utils/slugify';
import { NotificationService } from '../../../../../../shared/services/notification.service';

const KEYWORD = 'remove';

@Component({
  selector: 'app-delete-bank-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delete-bank-modal.component.html',
  styleUrl: './delete-bank-modal.component.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class DeleteBankModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bankService = inject(BankService);
  private readonly notificationService = inject(NotificationService);

  readonly open = input(false);
  readonly bank = input<Bank | null>(null);
  readonly closed = output<void>();
  readonly deleted = output<void>();

  readonly confirmInput = signal('');
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly keyword = KEYWORD;

  readonly canConfirm = computed(() => {
    const value = this.confirmInput().trim();
    const name = this.bank()?.name?.trim() ?? '';
    return value === KEYWORD || (!!name && value === name);
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.document.body.style.overflow = isOpen ? 'hidden' : '';
      if (!isOpen) {
        this.confirmInput.set('');
        this.submitting.set(false);
        this.submitError.set(null);
      }
    });

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.open() && !this.submitting()) {
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
    if (event.target === event.currentTarget && !this.submitting()) {
      this.closed.emit();
    }
  }

  close(): void {
    if (!this.submitting()) {
      this.closed.emit();
    }
  }

  confirm(): void {
    const bank = this.bank();
    if (!bank || !this.canConfirm() || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    this.bankService.deleteBank(bank.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notificationService.showSuccess(
          'Banque supprimée',
          `${bank.name} a été retirée.`
        );
        this.deleted.emit();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.submitError.set(
          extractApiError(err, 'Impossible de supprimer la banque. Réessayez.')
        );
      }
    });
  }
}
