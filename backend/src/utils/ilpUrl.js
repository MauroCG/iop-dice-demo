/**
 * Normalizes a Payment Pointer or URL into a safe HTTPS Open Payments resource URL.
 * e.g.:
 *  '$ilp.rafiki.money/alice' -> 'https://ilp.rafiki.money/alice'
 *  'https://ilp.rafiki.money/alice/' -> 'https://ilp.rafiki.money/alice'
 */
export function normalizePaymentPointer(pointer) {
  if (!pointer || typeof pointer !== 'string') {
    throw new Error('Puntero de pago inválido o no provisto');
  }

  const trimmed = pointer.trim();

  let url = trimmed;
  if (trimmed.startsWith('$')) {
    url = `https://${trimmed.slice(1)}`;
  } else if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    url = `https://${trimmed}`;
  }

  // Remove trailing slash if present
  return url.replace(/\/+$/, '');
}

/**
 * Returns canonical Payment Pointer format from an HTTPS URL.
 * e.g. 'https://ilp.rafiki.money/alice' -> '$ilp.rafiki.money/alice'
 */
export function toPaymentPointer(url) {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim().replace(/\/+$/, '');
  if (clean.startsWith('https://')) {
    return `$${clean.slice(8)}`;
  }
  if (clean.startsWith('http://')) {
    return `$${clean.slice(7)}`;
  }
  if (!clean.startsWith('$')) {
    return `$${clean}`;
  }
  return clean;
}
