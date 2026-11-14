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
import { UserService } from '../../services/user.service';
import { extractApiError } from '../../../../../../core/utils/slugify';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-user-modal.component.html',
  styleUrl: './create-user-modal.component.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class CreateUserModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userService = inject(UserService);

  readonly open = input(false);
  readonly closed = output<void>();
  readonly created = output<void>();

  readonly username = signal('');
  readonly email = signal('');
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly passwordVisible = signal(false);
  readonly confirmVisible = signal(false);
  readonly submitted = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly usernameError = computed(() => {
    if (!this.submitted()) {
      return null;
    }
    const value = this.username().trim();
    if (!value) {
      return "Le nom d'utilisateur est obligatoire.";
    }
    if (value.length < 3 || value.length > 50) {
      return "Le nom d'utilisateur doit contenir entre 3 et 50 caractères.";
    }
    return null;
  });

  readonly emailError = computed(() => {
    if (!this.submitted()) {
      return null;
    }
    const value = this.email().trim();
    if (!value) {
      return "L'email est obligatoire.";
    }
    if (!EMAIL_PATTERN.test(value)) {
      return "Le format de l'email est invalide.";
    }
    return null;
  });

  readonly passwordError = computed(() => {
    if (!this.submitted()) {
      return null;
    }
    if (!this.password()) {
      return 'Le mot de passe est obligatoire.';
    }
    if (this.password().length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    return null;
  });

  readonly confirmError = computed(() => {
    if (!this.submitted()) {
      return null;
    }
    if (!this.confirmPassword()) {
      return 'Confirmez le mot de passe.';
    }
    return this.confirmPassword() === this.password()
      ? null
      : 'Les mots de passe ne correspondent pas.';
  });

  readonly isValid = computed(() => {
    const username = this.username().trim();
    const email = this.email().trim();
    return (
      username.length >= 3 &&
      username.length <= 50 &&
      EMAIL_PATTERN.test(email) &&
      this.password().length >= 6 &&
      this.confirmPassword() === this.password()
    );
  });

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
    this.userService
      .createUser({
        username: this.username().trim(),
        email: this.email().trim(),
        password: this.password(),
        firstName: this.firstName().trim() || null,
        lastName: this.lastName().trim() || null
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.created.emit();
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.submitError.set(extractApiError(err, "Impossible de créer l'utilisateur. Réessayez."));
        }
      });
  }

  private resetForm(): void {
    this.username.set('');
    this.email.set('');
    this.firstName.set('');
    this.lastName.set('');
    this.password.set('');
    this.confirmPassword.set('');
    this.passwordVisible.set(false);
    this.confirmVisible.set(false);
    this.submitted.set(false);
    this.submitting.set(false);
    this.submitError.set(null);
  }
}
