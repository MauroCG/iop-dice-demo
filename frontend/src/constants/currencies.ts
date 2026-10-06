import type { AssetMetadata, WalletAddressResolved } from '../types/currency';

export const SUPPORTED_ASSETS: Record<string, AssetMetadata> = {
  USD: {
    code: 'USD',
    scale: 2,
    symbol: '$',
    name: 'Dólar Estadounidense',
    flag: '🇺🇸',
    exchangeRateToUSD: 1.0,
  },
  EUR: {
    code: 'EUR',
    scale: 2,
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    exchangeRateToUSD: 0.92,
  },
  GBP: {
    code: 'GBP',
    scale: 2,
    symbol: '£',
    name: 'Libra Esterlina',
    flag: '🇬🇧',
    exchangeRateToUSD: 0.78,
  },
  COP: {
    code: 'COP',
    scale: 0,
    symbol: 'COL$',
    name: 'Peso Colombiano',
    flag: '🇨🇴',
    exchangeRateToUSD: 4200.0,
  },
  MXN: {
    code: 'MXN',
    scale: 2,
    symbol: 'MX$',
    name: 'Peso Mexicano',
    flag: '🇲🇽',
    exchangeRateToUSD: 19.5,
  },
};

export interface DemoWalletPreset {
  pointer: string;
  label: string;
  resolved: WalletAddressResolved;
  presetGrants: number[];
  defaultGrant: number;
}

export const MULTI_ASSET_DEMO_WALLETS: DemoWalletPreset[] = [
  {
    pointer: '$ilp.rafiki.money/alice_usd',
    label: '🇺🇸 Alice (USD)',
    resolved: {
      id: 'https://ilp.rafiki.money/alice_usd',
      pointer: '$ilp.rafiki.money/alice_usd',
      assetCode: 'USD',
      assetScale: 2,
    },
    presetGrants: [1.0, 3.0, 5.0, 10.0],
    defaultGrant: 5.0,
  },
  {
    pointer: '$ilp.bancolombia.co/carlos_cop',
    label: '🇨🇴 Carlos (COP)',
    resolved: {
      id: 'https://ilp.bancolombia.co/carlos_cop',
      pointer: '$ilp.bancolombia.co/carlos_cop',
      assetCode: 'COP',
      assetScale: 0,
    },
    presetGrants: [5000, 10000, 20000, 50000],
    defaultGrant: 20000,
  },
  {
    pointer: '$ilp.gatehub.net/eva_eur',
    label: '🇪🇺 Eva (EUR)',
    resolved: {
      id: 'https://ilp.gatehub.net/eva_eur',
      pointer: '$ilp.gatehub.net/eva_eur',
      assetCode: 'EUR',
      assetScale: 2,
    },
    presetGrants: [1.0, 3.0, 5.0, 10.0],
    defaultGrant: 5.0,
  },
  {
    pointer: '$fynbos.dev/liam_gbp',
    label: '🇬🇧 Liam (GBP)',
    resolved: {
      id: 'https://fynbos.dev/liam_gbp',
      pointer: '$fynbos.dev/liam_gbp',
      assetCode: 'GBP',
      assetScale: 2,
    },
    presetGrants: [1.0, 2.0, 4.0, 8.0],
    defaultGrant: 4.0,
  },
  {
    pointer: '$bitso.com/diego_mxn',
    label: '🇲🇽 Diego (MXN)',
    resolved: {
      id: 'https://bitso.com/diego_mxn',
      pointer: '$bitso.com/diego_mxn',
      assetCode: 'MXN',
      assetScale: 2,
    },
    presetGrants: [20.0, 50.0, 100.0, 200.0],
    defaultGrant: 100.0,
  },
];
