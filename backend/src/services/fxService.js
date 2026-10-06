/**
 * Foreign Exchange (FX) Service for Interledger Cross-Currency Conversions.
 */

export const SUPPORTED_ASSETS = {
  USD: { code: 'USD', scale: 2, exchangeRateToUSD: 1.0 },
  EUR: { code: 'EUR', scale: 2, exchangeRateToUSD: 0.92 },
  GBP: { code: 'GBP', scale: 2, exchangeRateToUSD: 0.79 },
  COP: { code: 'COP', scale: 0, exchangeRateToUSD: 4200.0 },
  MXN: { code: 'MXN', scale: 2, exchangeRateToUSD: 19.50 },
};

/**
 * Converts an amount in USD to a player's native currency.
 */
export function convertUSDToNative(amountUSD, targetAssetCode = 'USD', targetAssetScale) {
  const asset = SUPPORTED_ASSETS[targetAssetCode.toUpperCase()] || SUPPORTED_ASSETS.USD;
  const scale = targetAssetScale !== undefined ? targetAssetScale : asset.scale;
  const raw = amountUSD * asset.exchangeRateToUSD;
  return Number(raw.toFixed(scale));
}

/**
 * Converts an amount in native currency back to USD.
 */
export function convertNativeToUSD(nativeAmount, sourceAssetCode = 'USD') {
  const asset = SUPPORTED_ASSETS[sourceAssetCode.toUpperCase()] || SUPPORTED_ASSETS.USD;
  if (asset.exchangeRateToUSD === 0) return 0;
  const raw = nativeAmount / asset.exchangeRateToUSD;
  return Number(raw.toFixed(2));
}

/**
 * Returns metadata and default scale for a given currency code.
 */
export function getAssetMetadata(assetCode = 'USD') {
  return SUPPORTED_ASSETS[assetCode.toUpperCase()] || {
    code: assetCode.toUpperCase(),
    scale: 2,
    exchangeRateToUSD: 1.0,
  };
}
