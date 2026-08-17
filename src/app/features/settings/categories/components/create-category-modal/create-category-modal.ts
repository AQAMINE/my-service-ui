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
import { CategoryService } from '../../../../../core/services/category.service';
import { extractApiError, slugify } from '../../../../../core/utils/slugify';

@Component({
  selector: 'app-create-category-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-category-modal.html',
  styleUrl: './create-category-modal.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class CreateCategoryModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly categoryService = inject(CategoryService);

  readonly open = input(false);
  readonly closed = output<void>();
  readonly created = output<void>();

  readonly name = signal('');
  readonly slug = signal('');
  readonly description = signal('');
  readonly slugTouched = signal(false);
  readonly submitted = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly nameError = computed(() => {
    if (!this.submitted() && !this.name().length) {
      return null;
    }
    if (this.submitted() && !this.name().trim()) {
      return 'Le nom est obligatoire.';
    }
    return null;
  });

  readonly slugError = computed(() => {
    if (!this.submitted() && !this.slugTouched()) {
      return null;
    }
    if (!this.slug().trim()) {
      return 'Le slug est obligatoire.';
    }
    return null;
  });

  readonly isValid = computed(
    () => !!this.name().trim() && !!this.slug().trim()
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
      this.slug.set(slugify(value, 50));
    }
  }

  onSlugChange(value: string): void {
    this.slugTouched.set(true);
    this.slug.set(slugify(value, 50));
  }

  onNameBlur(): void {
    if (!this.slugTouched()) {
      this.slug.set(slugify(this.name(), 50));
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
    this.categoryService
      .createCategory({
        name: this.name().trim(),
        slug: this.slug().trim(),
        description: this.description().trim() || null
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.created.emit();
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.submitError.set(extractApiError(err, 'Impossible de créer la catégorie. Réessayez.'));
        }
      });
  }

  private resetForm(): void {
    this.name.set('');
    this.slug.set('');
    this.description.set('');
    this.slugTouched.set(false);
    this.submitted.set(false);
    this.submitting.set(false);
    this.submitError.set(null);
  }
}
