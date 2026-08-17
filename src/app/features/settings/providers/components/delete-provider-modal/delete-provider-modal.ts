import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Provider } from '../../../../../core/models/provider';
import { ProviderService } from '../../../../../core/services/provider.service';
import { extractApiError } from '../../../../../core/utils/slugify';

@Component({
  selector: 'app-delete-provider-modal',
  standalone: true,
  templateUrl: './delete-provider-modal.html',
  styleUrl: './delete-provider-modal.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class DeleteProviderModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly providerService = inject(ProviderService);

  readonly open = input(false);
  readonly provider = input<Provider | null>(null);
  readonly closed = output<void>();
  readonly deleted = output<void>();

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.document.body.style.overflow = isOpen ? 'hidden' : '';
      if (!isOpen) {
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
    if (!provider || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    this.providerService.deleteProvider(provider.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.submitError.set(extractApiError(err, 'Impossible de supprimer le provider. Réessayez.'));
      }
    });
  }
}
