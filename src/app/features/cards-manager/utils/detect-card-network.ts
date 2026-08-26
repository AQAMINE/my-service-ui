/**
 * Detects card network from PAN IIN/BIN prefixes.
 * Returns provider `code` values used by my-service-cards (VISA, MASTERCARD).
 */
export function detectCardNetworkCode(panDigits: string): 'VISA' | 'MASTERCARD' | null {
  const digits = panDigits.replace(/\D/g, '');
  if (!digits) {
    return null;
  }

  if (digits.startsWith('4')) {
    return 'VISA';
  }

  if (digits.length >= 2) {
    const prefix2 = Number(digits.slice(0, 2));
    if (prefix2 >= 51 && prefix2 <= 55) {
      return 'MASTERCARD';
    }
  }

  if (digits.length >= 4) {
    const prefix4 = Number(digits.slice(0, 4));
    if (prefix4 >= 2221 && prefix4 <= 2720) {
      return 'MASTERCARD';
    }
  }

  return null;
}
