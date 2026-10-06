import type { AssetMetadata } from '../types/currency';

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

