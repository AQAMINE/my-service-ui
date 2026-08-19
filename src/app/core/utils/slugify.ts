export function slugify(value: string, maxLength = 100): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLength);
}

export function extractApiError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error?: unknown; status?: number }).error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object') {
      const message =
        (body as { message?: string; error?: string }).message ??
        (body as { message?: string; error?: string }).error;
      if (message) {
        return message;
      }
    }
    if ((err as { status?: number }).status === 403) {
      return 'Accès refusé. Réservé aux administrateurs.';
    }
    if ((err as { status?: number }).status === 400) {
      return 'Données invalides. Vérifiez le formulaire.';
    }
  }
  return fallback;
}

export function simpleIconUrl(slug: string, color: string): string {
  const safe = color.replace('#', '').replace(/[^0-9a-fA-F]/g, '') || '000000';
  return `https://cdn.simpleicons.org/${slug}/${safe}`;
}
