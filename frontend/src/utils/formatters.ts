export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function truncatePointer(pointer: string, maxLen = 22): string {
  if (!pointer) return '';
  if (pointer.length <= maxLen) return pointer;
  const parts = pointer.split('/');
  if (parts.length > 1) {
    const prefix = parts[0];
    const suffix = parts.slice(1).join('/');
    if (prefix.length + suffix.length > maxLen) {
      return `${prefix}/...${suffix.slice(-4)}`;
    }
  }
  return `${pointer.slice(0, 12)}...${pointer.slice(-6)}`;
}

export function formatTimeSeconds(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${s}s`;
}

export function formatTimestamp(ts: number): string {
  return new Intl.DateTimeFormat('es-419', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(ts));
}
