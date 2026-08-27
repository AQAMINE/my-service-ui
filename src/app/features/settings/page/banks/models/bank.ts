export interface Bank {
  id: string;
  name: string;
  code: string;
  websiteUrl?: string | null;
  primaryColor?: string | null;
  logoUrl?: string | null;
  system?: boolean;
  isSystem?: boolean;
}

export interface CreateBankRequest {
  name: string;
  code: string;
  websiteUrl?: string | null;
  primaryColor?: string | null;
  logoUrl?: string | null;
}

export function isSystemBank(bank: Bank): boolean {
  return bank.system === true || bank.isSystem === true;
}
