export interface Provider {
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

export interface CreateProviderRequest {
  name: string;
  slug: string;
  websiteUrl?: string | null;
  color?: string | null;
  logoUrl?: string | null;
}

export interface SimpleIconOption {
  slug: string;
  label: string;
  defaultColor: string;
  aliases?: string[];
}
