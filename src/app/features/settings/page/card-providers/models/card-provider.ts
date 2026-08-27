export interface CardProvider {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
  system?: boolean;
  isSystem?: boolean;
}

export interface CreateCardProviderRequest {
  name: string;
  code: string;
  logoUrl?: string | null;
}

export function isSystemCardProvider(provider: CardProvider): boolean {
  return provider.system === true || provider.isSystem === true;
}
