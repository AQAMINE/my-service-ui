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
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  CreateExternalAccountRequest,
  SearchableSelectOption
} from '../../models/external-account';
import { CategoryService } from '../../../../core/services/category.service';
import { ProviderService } from '../../../../core/services/provider.service';
import { ExternalAccountService } from '../../services/external-account.service';
import { PmSearchableSelect } from '../pm-searchable-select/pm-searchable-select';

@Component({
  selector: 'app-pm-create-account-modal',
  standalone: true,
  imports: [FormsModule, PmSearchableSelect],
  templateUrl: './pm-create-account-modal.html',
  styleUrl: './pm-create-account-modal.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class PmCreateAccountModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly categoryService = inject(CategoryService);
  private readonly providerService = inject(ProviderService);
  private readonly accountService = inject(ExternalAccountService);

  readonly open = input(false);

  readonly closed = output<void>();
  readonly created = output<void>();

  readonly optionsLoading = signal(false);
  readonly optionsError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly categoryOptions = signal<SearchableSelectOption[]>([]);
  readonly providerOptions = signal<SearchableSelectOption[]>([]);

  readonly categoryId = signal<string | null>(null);
  readonly providerId = signal<string | null>(null);
  readonly fullName = signal('');
  readonly username = signal('');
  readonly email = signal('');
  readonly rawPassword = signal('');
  readonly confirmPassword = signal('');
  readonly link = signal('');
  readonly description = signal('');

  readonly passwordVisible = signal(false);
  readonly confirmVisible = signal(false);

  readonly touched = signal({
    categoryId: false,
    providerId: false,
    rawPassword: false,
    confirmPassword: false
  });

  readonly categoryError = computed(() => {
    if (!this.shouldShowError('categoryId')) {
      return null;
    }
    return this.categoryId() ? null : 'La catégorie est obligatoire.';
  });

  readonly providerError = computed(() => {
    if (!this.shouldShowError('providerId')) {
      return null;
    }
    return this.providerId() ? null : 'Le provider est obligatoire.';
  });

  readonly passwordError = computed(() => {
    if (!this.shouldShowError('rawPassword')) {
      return null;
    }
    return this.rawPassword().trim() ? null : 'Le mot de passe est obligatoire.';
  });

  readonly confirmError = computed(() => {
    if (!this.shouldShowError('confirmPassword')) {
      return null;
    }
    if (!this.confirmPassword()) {
      return 'Confirmez le mot de passe.';
    }
    return this.confirmPassword() === this.rawPassword()
      ? null
      : 'Les mots de passe ne correspondent pas.';
  });

  readonly isValid = computed(() => {
    return (
      !!this.categoryId() &&
      !!this.providerId() &&
      !!this.rawPassword().trim() &&
      this.confirmPassword() === this.rawPassword()
    );
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        this.resetForm();
        this.loadOptions();
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
    if (this.submitting()) {
      return;
    }
    this.closed.emit();
  }

  markTouched(field: 'categoryId' | 'providerId' | 'rawPassword' | 'confirmPassword'): void {
    this.touched.update((current) => ({ ...current, [field]: true }));
  }

  onCategoryChange(id: string | null): void {
    this.categoryId.set(id);
    this.markTouched('categoryId');
  }

  onProviderChange(id: string | null): void {
    this.providerId.set(id);
    this.markTouched('providerId');
  }

  submit(): void {
    this.submitted.set(true);
    this.touched.set({
      categoryId: true,
      providerId: true,
      rawPassword: true,
      confirmPassword: true
    });
    this.submitError.set(null);

    if (!this.isValid() || this.submitting()) {
      return;
    }

    const body: CreateExternalAccountRequest = {
      categoryId: this.categoryId()!,
      providerId: this.providerId()!,
      rawPassword: this.rawPassword(),
      fullName: this.optional(this.fullName()),
      username: this.optional(this.username()),
      email: this.optional(this.email()),
      link: this.optional(this.link()),
      description: this.optional(this.description())
    };

    this.submitting.set(true);
    this.accountService.createAccount(body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.created.emit();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.submitError.set(this.extractErrorMessage(err));
      }
    });
  }

  private loadOptions(): void {
    this.optionsLoading.set(true);
    this.optionsError.set(null);

    forkJoin({
      categories: this.categoryService.getCategories(),
      providers: this.providerService.getProviders()
    }).subscribe({
      next: ({ categories, providers }) => {
        this.categoryOptions.set(
          categories
            .map((c) => ({ id: c.id, label: c.name }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
        this.providerOptions.set(
          providers
            .map((p) => ({
              id: p.id,
              label: p.name,
              logoUrl: p.logoUrl,
              color: p.color
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
        this.optionsLoading.set(false);
      },
      error: () => {
        this.categoryOptions.set([]);
        this.providerOptions.set([]);
        this.optionsLoading.set(false);
        this.optionsError.set('Impossible de charger les catégories et providers.');
      }
    });
  }

  private resetForm(): void {
    this.categoryId.set(null);
    this.providerId.set(null);
    this.fullName.set('');
    this.username.set('');
    this.email.set('');
    this.rawPassword.set('');
    this.confirmPassword.set('');
    this.link.set('');
    this.description.set('');
    this.passwordVisible.set(false);
    this.confirmVisible.set(false);
    this.submitting.set(false);
    this.submitError.set(null);
    this.submitted.set(false);
    this.touched.set({
      categoryId: false,
      providerId: false,
      rawPassword: false,
      confirmPassword: false
    });
  }

  private shouldShowError(
    field: 'categoryId' | 'providerId' | 'rawPassword' | 'confirmPassword'
  ): boolean {
    return this.submitted() || this.touched()[field];
  }

  private optional(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.trim()) {
        return body;
      }
      if (body && typeof body === 'object') {
        const message = (body as { message?: string; error?: string }).message
          ?? (body as { message?: string; error?: string }).error;
        if (message) {
          return message;
        }
      }
      if (err.status === 400) {
        return 'Données invalides. Vérifiez le formulaire.';
      }
    }
    return 'Impossible de créer le compte. Réessayez.';
  }
}
