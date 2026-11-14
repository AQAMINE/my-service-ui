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
import { CardProvider } from '../../models/card-provider';
import { CardProviderService } from '../../services/card-provider.service';
import { extractApiError } from '../../../../../../core/utils/slugify';
import { NotificationService } from '../../../../../../shared/services/notification.service';

const KEYWORD = 'delete';

@Component({
  selector: 'app-delete-card-provider-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delete-card-provider-modal.component.html',
  styleUrl: './delete-card-provider-modal.component.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class DeleteCardProviderModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly providerService = inject(CardProviderService);
  private readonly notificationService = inject(NotificationService);

  readonly open = input(false);
  readonly provider = input<CardProvider | null>(null);
  readonly closed = output<void>();
  readonly deleted = output<void>();

  readonly confirmInput = signal('');
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly keyword = KEYWORD;

  readonly canConfirm = computed(() => {
    const value = this.confirmInput().trim();
    const name = this.provider()?.name?.trim() ?? '';
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
    const provider = this.provider();
    if (!provider || !this.canConfirm() || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    this.providerService.deleteProvider(provider.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notificationService.showSuccess(
          'Réseau supprimé',
          `${provider.name} a été retiré.`
        );
        this.deleted.emit();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.submitError.set(
          extractApiError(err, 'Impossible de supprimer le réseau. Réessayez.')
        );
      }
    });
  }
}
