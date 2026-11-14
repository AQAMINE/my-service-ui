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
import { forkJoin } from 'rxjs';
import {
  BankSummary,
  CardProviderSummary,
  CreateCardRequest,
  LogoSelectOption
} from '../../models/bank-card';
import { BankCardService } from '../../services/bank-card.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { extractApiError } from '../../../../core/utils/slugify';
import { CmLogoSelect } from '../cm-logo-select/cm-logo-select.component';
import { detectCardNetworkCode } from '../../utils/detect-card-network';

const DEFAULT_CARD_COLOR = '#1A1A1A';

@Component({
  selector: 'app-cm-create-card-modal',
  standalone: true,
  imports: [FormsModule, CmLogoSelect],
  templateUrl: './cm-create-card-modal.component.html',
  styleUrl: './cm-create-card-modal.component.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : true'
  }
})
export class CmCreateCardModal {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cardService = inject(BankCardService);
  private readonly notificationService = inject(NotificationService);

  readonly open = input(false);
  readonly closed = output<void>();
  readonly created = output<void>();

  readonly optionsLoading = signal(false);
  readonly optionsError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly banks = signal<BankSummary[]>([]);
  readonly providers = signal<CardProviderSummary[]>([]);

  readonly bankId = signal<string | null>(null);
  readonly providerId = signal<string | null>(null);
  readonly cardHolderName = signal('');
  readonly cardName = signal('');
  readonly pan = signal('');
  readonly cvv = signal('');
  readonly pin = signal('');
  readonly confirmPin = signal('');
  readonly expiryMonth = signal(12);
  readonly expiryYear = signal(new Date().getFullYear() + 2);
  readonly cardColor = signal(DEFAULT_CARD_COLOR);
  readonly colorCustomized = signal(false);
  /** When true, manual Réseau choice wins over PAN auto-detect. */
  readonly providerManuallySelected = signal(false);

  readonly panVisible = signal(false);
  readonly cvvVisible = signal(false);
  readonly pinVisible = signal(false);
  readonly confirmPinVisible = signal(false);

  readonly bankLogoFailed = signal(false);
  readonly providerLogoFailed = signal(false);

  readonly touched = signal({
    bankId: false,
    providerId: false,
    cardHolderName: false,
    cardName: false,
    pan: false,
    cvv: false,
    pin: false,
    confirmPin: false,
    expiryMonth: false,
    expiryYear: false
  });

  readonly bankOptions = computed<LogoSelectOption[]>(() =>
    this.banks().map((bank) => ({
      id: bank.id,
      label: bank.name,
      logoUrl: bank.logoUrl,
      color: bank.primaryColor
    }))
  );

  readonly providerOptions = computed<LogoSelectOption[]>(() =>
    this.providers().map((provider) => ({
      id: provider.id,
      label: provider.name,
      logoUrl: provider.logoUrl
    }))
  );

  readonly selectedBank = computed(
    () => this.banks().find((bank) => bank.id === this.bankId()) ?? null
  );

  readonly selectedProvider = computed(
    () => this.providers().find((provider) => provider.id === this.providerId()) ?? null
  );

  readonly previewSurface = computed(
    () => this.cardColor() || this.selectedBank()?.primaryColor || DEFAULT_CARD_COLOR
  );

  readonly previewPan = computed(() => {
    const digits = this.pan().replace(/\D/g, '');
    if (digits.length >= 4) {
      return `•••• •••• •••• ${digits.slice(-4)}`;
    }
    return '•••• •••• •••• ••••';
  });

  readonly previewExpiry = computed(() => {
    const month = String(this.expiryMonth()).padStart(2, '0');
    const year = String(this.expiryYear()).slice(-2);
    return `${month}/${year}`;
  });

  readonly yearOptions = computed(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, i) => start + i);
  });

  readonly bankError = computed(() =>
    this.shouldShowError('bankId') && !this.bankId() ? 'La banque est obligatoire.' : null
  );

  readonly providerError = computed(() =>
    this.shouldShowError('providerId') && !this.providerId()
      ? 'Le réseau est obligatoire.'
      : null
  );

  readonly holderError = computed(() =>
    this.shouldShowError('cardHolderName') && !this.cardHolderName().trim()
      ? 'Le titulaire est obligatoire.'
      : null
  );

  readonly nameError = computed(() =>
    this.shouldShowError('cardName') && !this.cardName().trim()
      ? 'Le nom de la carte est obligatoire.'
      : null
  );

  readonly panError = computed(() => {
    if (!this.shouldShowError('pan')) {
      return null;
    }
    const digits = this.pan().replace(/\D/g, '');
    if (!digits) {
      return 'Le numéro de carte est obligatoire.';
    }
    if (!/^[0-9]{13,19}$/.test(digits)) {
      return 'Le PAN doit contenir 13 à 19 chiffres.';
    }
    return null;
  });

  readonly cvvError = computed(() => {
    if (!this.shouldShowError('cvv')) {
      return null;
    }
    const value = this.cvv().trim();
    if (!value) {
      return 'Le CVV est obligatoire.';
    }
    if (!/^[0-9]{3,4}$/.test(value)) {
      return 'Le CVV doit contenir 3 ou 4 chiffres.';
    }
    return null;
  });

  readonly pinError = computed(() => {
    if (!this.shouldShowError('pin')) {
      return null;
    }
    const value = this.pin().trim();
    if (!value) {
      return 'Le PIN est obligatoire.';
    }
    if (!/^[0-9]{4}$/.test(value)) {
      return 'Le PIN doit contenir 4 chiffres.';
    }
    return null;
  });

  readonly confirmPinError = computed(() => {
    if (!this.shouldShowError('confirmPin')) {
      return null;
    }
    if (!this.confirmPin().trim()) {
      return 'Confirmez le PIN.';
    }
    if (this.confirmPin() !== this.pin()) {
      return 'Les PIN ne correspondent pas.';
    }
    return null;
  });

  readonly monthError = computed(() => {
    if (!this.shouldShowError('expiryMonth')) {
      return null;
    }
    const month = this.expiryMonth();
    if (month < 1 || month > 12) {
      return 'Mois invalide.';
    }
    return null;
  });

  readonly yearError = computed(() => {
    if (!this.shouldShowError('expiryYear')) {
      return null;
    }
    if (this.expiryYear() < new Date().getFullYear()) {
      return 'Année invalide.';
    }
    return null;
  });

  readonly formValid = computed(
    () =>
      !!this.bankId() &&
      !!this.providerId() &&
      !!this.cardHolderName().trim() &&
      !!this.cardName().trim() &&
      /^[0-9]{13,19}$/.test(this.pan().replace(/\D/g, '')) &&
      /^[0-9]{3,4}$/.test(this.cvv().trim()) &&
      /^[0-9]{4}$/.test(this.pin().trim()) &&
      this.pin() === this.confirmPin() &&
      this.expiryMonth() >= 1 &&
      this.expiryMonth() <= 12 &&
      this.expiryYear() >= new Date().getFullYear()
  );

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        this.resetForm();
        this.loadOptions();
      } else {
        this.optionsError.set(null);
        this.submitError.set(null);
      }
    });

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.open() && !this.submitting()) {
        this.close();
      }
    };
    this.document.addEventListener('keydown', onKeydown);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('keydown', onKeydown);
      this.document.body.style.overflow = '';
    });
  }

  close(): void {
    if (this.submitting()) {
      return;
    }
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onBankChange(id: string | null): void {
    this.bankId.set(id);
    this.bankLogoFailed.set(false);
    const bank = this.banks().find((item) => item.id === id);
    if (bank?.primaryColor && !this.colorCustomized()) {
      this.cardColor.set(bank.primaryColor);
    }
  }

  onProviderChange(id: string | null): void {
    this.providerId.set(id);
    this.providerLogoFailed.set(false);
    this.providerManuallySelected.set(true);
  }

  onPanChange(value: string): void {
    this.pan.set(value);
    this.applyAutoProviderFromPan();
  }

  onColorChange(value: string): void {
    this.cardColor.set(value);
    this.colorCustomized.set(true);
  }

  markTouched(field: keyof ReturnType<typeof this.touched>): void {
    this.touched.update((current) => ({ ...current, [field]: true }));
  }

  submit(): void {
    this.submitted.set(true);
    this.submitError.set(null);
    if (!this.formValid() || this.submitting()) {
      return;
    }

    const body: CreateCardRequest = {
      bankId: this.bankId()!,
      providerId: this.providerId()!,
      cardHolderName: this.cardHolderName().trim(),
      cardName: this.cardName().trim(),
      pan: this.pan().replace(/\D/g, ''),
      cvv: this.cvv().trim(),
      pin: this.pin().trim(),
      expiryMonth: this.expiryMonth(),
      expiryYear: this.expiryYear(),
      cardColor: this.cardColor()
    };

    this.submitting.set(true);
    this.cardService.createCard(body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notificationService.showSuccess(
          'Carte ajoutée',
          `${body.cardName} a été enregistrée dans votre wallet.`
        );
        this.created.emit();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.submitError.set(
          extractApiError(err, 'Impossible de créer la carte. Vérifiez les données.')
        );
      }
    });
  }

  private loadOptions(): void {
    this.optionsLoading.set(true);
    this.optionsError.set(null);
    forkJoin({
      banks: this.cardService.getBanks(),
      providers: this.cardService.getProviders()
    }).subscribe({
      next: ({ banks, providers }) => {
        this.banks.set([...banks].sort((a, b) => a.name.localeCompare(b.name)));
        this.providers.set([...providers].sort((a, b) => a.name.localeCompare(b.name)));
        this.optionsLoading.set(false);
        this.applyAutoProviderFromPan();
      },
      error: (err: unknown) => {
        this.optionsLoading.set(false);
        this.optionsError.set(
          extractApiError(err, 'Impossible de charger les banques et réseaux.')
        );
      }
    });
  }

  private resetForm(): void {
    this.bankId.set(null);
    this.providerId.set(null);
    this.cardHolderName.set('');
    this.cardName.set('');
    this.pan.set('');
    this.cvv.set('');
    this.pin.set('');
    this.confirmPin.set('');
    this.expiryMonth.set(12);
    this.expiryYear.set(new Date().getFullYear() + 2);
    this.cardColor.set(DEFAULT_CARD_COLOR);
    this.colorCustomized.set(false);
    this.providerManuallySelected.set(false);
    this.panVisible.set(false);
    this.cvvVisible.set(false);
    this.pinVisible.set(false);
    this.confirmPinVisible.set(false);
    this.bankLogoFailed.set(false);
    this.providerLogoFailed.set(false);
    this.submitted.set(false);
    this.submitting.set(false);
    this.submitError.set(null);
    this.touched.set({
      bankId: false,
      providerId: false,
      cardHolderName: false,
      cardName: false,
      pan: false,
      cvv: false,
      pin: false,
      confirmPin: false,
      expiryMonth: false,
      expiryYear: false
    });
  }

  private applyAutoProviderFromPan(): void {
    if (this.providerManuallySelected()) {
      return;
    }

    const networkCode = detectCardNetworkCode(this.pan());
    if (!networkCode) {
      return;
    }

    const match = this.providers().find(
      (provider) => provider.code.toUpperCase() === networkCode
    );
    if (!match) {
      return;
    }

    if (this.providerId() !== match.id) {
      this.providerId.set(match.id);
      this.providerLogoFailed.set(false);
    }
  }

  private shouldShowError(field: keyof ReturnType<typeof this.touched>): boolean {
    return this.submitted() || this.touched()[field];
  }
}
