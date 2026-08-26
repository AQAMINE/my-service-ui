export interface BankSummary {
  id: string;
  userId?: string | null;
  name: string;
  code: string;
  websiteUrl?: string | null;
  primaryColor?: string | null;
  logoUrl?: string | null;
  isSystem?: boolean;
  system?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CardProviderSummary {
  id: string;
  userId?: string | null;
  name: string;
  code: string;
  logoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  system?: boolean;
}

export interface BankCard {
  id: string;
  userId: string;
  bank: BankSummary;
  provider: CardProviderSummary;
  cardHolderName: string;
  cardName: string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  cardColor: string | null;
  encryptedPan: string | null;
  encryptedCvv: string | null;
  encryptedPin: string | null;
  pinIv: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardRequest {
  bankId: string;
  providerId: string;
  cardHolderName: string;
  cardName: string;
  pan: string;
  cvv: string;
  pin: string;
  expiryMonth: number;
  expiryYear: number;
  cardColor?: string | null;
}

export interface LogoSelectOption {
  id: string;
  label: string;
  logoUrl?: string | null;
  color?: string | null;
}

export type ViewMode = 'list' | 'grid';
export type SortField = 'cardName' | 'bank' | 'expiry' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';
