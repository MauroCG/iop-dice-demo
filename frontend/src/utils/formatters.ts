import { SUPPORTED_ASSETS } from '../constants/currencies';

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAssetAmount(
  amount: number,
  assetCode = 'USD',
  assetScale?: number
): string {
  const scale =
    assetScale !== undefined
      ? assetScale
      : SUPPORTED_ASSETS[assetCode]?.scale ?? (assetCode === 'COP' ? 0 : 2);

  try {
    return new Intl.NumberFormat('es-419', {
      style: 'currency',
      currency: assetCode,
      minimumFractionDigits: scale,
      maximumFractionDigits: scale,
    }).format(amount);
  } catch {
    return `${amount.toFixed(scale)} ${assetCode}`;
  }
}

export function convertUSDToNative(
  amountUSD: number,
  targetAssetCode: string,
  targetAssetScale?: number
): number {
  const asset = SUPPORTED_ASSETS[targetAssetCode] || SUPPORTED_ASSETS.USD;
  const scale = targetAssetScale !== undefined ? targetAssetScale : asset.scale;
  const raw = amountUSD * asset.exchangeRateToUSD;
  return Number(raw.toFixed(scale));
}

export function convertNativeToUSD(
  nativeAmount: number,
  sourceAssetCode: string
): number {
  const asset = SUPPORTED_ASSETS[sourceAssetCode] || SUPPORTED_ASSETS.USD;
  if (asset.exchangeRateToUSD === 0) return 0;
  const raw = nativeAmount / asset.exchangeRateToUSD;
  return Number(raw.toFixed(2));
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
