export interface WalletAddressResolved {
  id: string; // URL Open Payments (ej. 'https://ilp.rafiki.money/alice')
  pointer: string; // '$ilp.rafiki.money/alice'
  assetCode: string; // 'USD' | 'EUR' | 'GBP' | 'COP' | 'MXN'
  assetScale: number; // 2 para centavos estándar; 0 para monedas enteras como COP
  authServer?: string;
  resourceServer?: string;
}

export interface AssetMetadata {
  code: string;
  scale: number;
  symbol: string;
  name: string;
  flag: string;
  exchangeRateToUSD: number; // 1 USD = X unidades nativas
}
