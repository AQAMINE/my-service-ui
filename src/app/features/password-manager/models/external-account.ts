export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProviderSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  color: string;
  websiteUrl: string;
}

export interface ExternalAccount {
  id: string;
  userId: string;
  category: CategorySummary;
  provider: ProviderSummary;
  fullName: string;
  username: string;
  email: string;
  link: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RankedStat {
  id: string;
  name: string;
  count: number;
  logoUrl?: string;
  color?: string;
}

export type ViewMode = 'list' | 'grid';
export type SortField = 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface CategoryOption {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export interface ProviderOption {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  websiteUrl: string | null;
  color: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateExternalAccountRequest {
  categoryId: string;
  providerId: string;
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
  rawPassword: string;
  link?: string | null;
  description?: string | null;
}

export interface SearchableSelectOption {
  id: string;
  label: string;
  logoUrl?: string | null;
  color?: string | null;
}
