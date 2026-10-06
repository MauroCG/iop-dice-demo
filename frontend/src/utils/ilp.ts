import { paymentPointerRegex } from '../schemas/wallet.schema';

export function isValidPaymentPointer(pointer: string): boolean {
  if (!pointer) return false;
  return paymentPointerRegex.test(pointer.trim());
}

export function normalizePaymentPointer(pointer: string): string {
  let trimmed = pointer.trim();
  if (trimmed.startsWith('https://')) {
    trimmed = '$' + trimmed.slice(8);
  } else if (trimmed.startsWith('http://')) {
    trimmed = '$' + trimmed.slice(7);
  }
  return trimmed;
}

export function pointerToOpenPaymentsUrl(pointer: string): string {
  if (pointer.startsWith('$')) {
    return `https://${pointer.slice(1)}`;
  }
  return pointer;
}
