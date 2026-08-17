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
import { SimpleIconOption } from '../../../../../core/models/provider';
import { ProviderService } from '../../../../../core/services/provider.service';
import { extractApiError, simpleIconUrl, slugify } from '../../../../../core/utils/slugify';
import { IconPicker } from '../icon-picker/icon-picker';

@Component({
  selector: 'app-create-provider-modal',
  standalone: true,
  imports: [FormsModule, IconPicker],
  templateUrl: './create-provider-modal.html',
  styleUrl: './create-provider-modal.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class CreateProviderModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly providerService = inject(ProviderService);

  readonly open = input(false);
  readonly closed = output<void>();
  readonly created = output<void>();

  readonly name = signal('');
  readonly slug = signal('');
  readonly websiteUrl = signal('');
  readonly color = signal('#00ABE4');
  readonly iconSlug = signal<string | null>(null);
  readonly slugTouched = signal(false);
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
  readonly slugError = computed(() =>
    this.submitted() && !this.slug().trim() ? 'Le slug est obligatoire.' : null
  );
  readonly iconError = computed(() =>
    this.submitted() && !this.iconSlug() ? 'Choisissez une icône.' : null
  );

  readonly isValid = computed(
    () => !!this.name().trim() && !!this.slug().trim() && !!this.iconSlug()
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
    if (!this.slugTouched()) {
      this.slug.set(slugify(value, 100));
    }
  }

  onSlugChange(value: string): void {
    this.slugTouched.set(true);
    this.slug.set(slugify(value, 100));
  }

  onNameBlur(): void {
    if (!this.slugTouched()) {
      this.slug.set(slugify(this.name(), 100));
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

    this.submitting.set(true);
    this.providerService
      .createProvider({
        name: this.name().trim(),
        slug: this.slug().trim(),
        websiteUrl: this.websiteUrl().trim() || null,
        color: this.color(),
        logoUrl: this.logoUrl()
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.created.emit();
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.submitError.set(extractApiError(err, 'Impossible de créer le provider. Réessayez.'));
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
    return this.color() || '#00ABE4';
  }

  private resetForm(): void {
    this.name.set('');
    this.slug.set('');
    this.websiteUrl.set('');
    this.color.set('#00ABE4');
    this.iconSlug.set(null);
    this.slugTouched.set(false);
    this.submitted.set(false);
    this.submitting.set(false);
    this.submitError.set(null);
    this.logoFailed.set(false);
  }
}
