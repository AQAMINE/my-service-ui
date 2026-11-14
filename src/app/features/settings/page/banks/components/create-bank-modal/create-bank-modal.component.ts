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
import { SimpleIconOption } from '../../../../../../shared/models/simple-icon';
import { IconPicker } from '../../../../../../shared/components/icon-picker/icon-picker.component';
import {
  extractApiError,
  simpleIconUrl,
  toEntityCode
} from '../../../../../../core/utils/slugify';
import { BankService } from '../../services/bank.service';
import { NotificationService } from '../../../../../../shared/services/notification.service';

@Component({
  selector: 'app-create-bank-modal',
  standalone: true,
  imports: [FormsModule, IconPicker],
  templateUrl: './create-bank-modal.component.html',
  styleUrl: './create-bank-modal.component.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class CreateBankModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bankService = inject(BankService);
  private readonly notificationService = inject(NotificationService);

  readonly open = input(false);
  readonly closed = output<void>();
  readonly created = output<void>();

  readonly name = signal('');
  readonly code = signal('');
  readonly websiteUrl = signal('');
  readonly color = signal('#00529B');
  readonly iconSlug = signal<string | null>(null);
  readonly codeTouched = signal(false);
  readonly submitted = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly logoFailed = signal(false);

  readonly logoUrl = computed(() => {
    const slug = this.iconSlug();
    if (!slug) {
      return null;
    }
    return simpleIconUrl(slug, this.color());
  });

  readonly previewInitials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  });

  readonly nameError = computed(() =>
    this.submitted() && !this.name().trim() ? 'Le nom est obligatoire.' : null
  );
  readonly codeError = computed(() =>
    this.submitted() && !this.code().trim() ? 'Le code est obligatoire.' : null
  );
  readonly iconError = computed(() =>
    this.submitted() && !this.iconSlug() ? 'Choisissez une icône.' : null
  );

  readonly isValid = computed(
    () => !!this.name().trim() && !!this.code().trim() && !!this.iconSlug()
  );

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        this.resetForm();
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

  onNameChange(value: string): void {
    this.name.set(value);
    if (!this.codeTouched()) {
      this.code.set(toEntityCode(value));
    }
  }

  onCodeChange(value: string): void {
    this.codeTouched.set(true);
    this.code.set(toEntityCode(value));
  }

  onNameBlur(): void {
    if (!this.codeTouched()) {
      this.code.set(toEntityCode(this.name()));
    }
  }

  onIconSelected(icon: SimpleIconOption): void {
    this.iconSlug.set(icon.slug);
    this.color.set(this.normalizeColor(icon.defaultColor));
    this.logoFailed.set(false);
  }

  onColorPickerChange(value: string): void {
    this.color.set(this.normalizeColor(value));
    this.logoFailed.set(false);
  }

  onHexChange(value: string): void {
    const hex = value.trim().replace('#', '');
    if (/^[0-9a-fA-F]{6}$/.test(hex) || /^[0-9a-fA-F]{3}$/.test(hex)) {
      this.color.set(this.normalizeColor(value));
      this.logoFailed.set(false);
    }
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

  submit(): void {
    this.submitted.set(true);
    this.submitError.set(null);
    if (!this.isValid() || this.submitting()) {
      return;
    }

    const name = this.name().trim();
    this.submitting.set(true);
    this.bankService
      .createBank({
        name,
        code: this.code().trim(),
        websiteUrl: this.websiteUrl().trim() || null,
        primaryColor: this.color(),
        logoUrl: this.logoUrl()
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.notificationService.showSuccess(
            'Banque ajoutée',
            `${name} a été créée.`
          );
          this.created.emit();
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.submitError.set(
            extractApiError(err, 'Impossible de créer la banque. Réessayez.')
          );
        }
      });
  }

  private normalizeColor(value: string): string {
    const hex = value.trim().replace('#', '');
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      return `#${hex.toUpperCase()}`;
    }
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toUpperCase();
    }
    return this.color() || '#00529B';
  }

  private resetForm(): void {
    this.name.set('');
    this.code.set('');
    this.websiteUrl.set('');
    this.color.set('#00529B');
    this.iconSlug.set(null);
    this.codeTouched.set(false);
    this.submitted.set(false);
    this.submitting.set(false);
    this.submitError.set(null);
    this.logoFailed.set(false);
  }
}
