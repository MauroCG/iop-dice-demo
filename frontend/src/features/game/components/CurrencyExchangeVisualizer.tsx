import React from 'react';
import { ArrowLeftRight, Zap } from 'lucide-react';
import { useWallet } from '../../../context/WalletContext';
import { SUPPORTED_ASSETS } from '../../../constants/currencies';
import { convertUSDToNative, formatAssetAmount } from '../../../utils/formatters';
import { CurrencyBadge } from '../../../components/shared/CurrencyBadge';

export const CurrencyExchangeVisualizer: React.FC = () => {
  const { grant, isConnected } = useWallet();

  const assetCode = grant?.assetCode || 'USD';
  const assetScale = grant?.assetScale ?? 2;
  const asset = SUPPORTED_ASSETS[assetCode] || SUPPORTED_ASSETS.USD;

  const isBaseCurrency = assetCode === 'USD';
  const nativeEquivalent = convertUSDToNative(0.10, assetCode, assetScale);
  const formattedNative = formatAssetAmount(nativeEquivalent, assetCode, assetScale);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-xl bg-dark-base/80 border border-slate-800 text-xs">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-neon-cyan/10 text-neon-cyan shrink-0">
          <ArrowLeftRight className="w-3 h-3" />
        </div>

        <div className="flex items-center gap-1.5 truncate">
          <span className="text-slate-300 font-medium text-[11px] truncate">
            {isBaseCurrency ? (
              'Apostando 10¢ USD (Moneda base de la mesa)'
            ) : (
              <>
                Apostando <strong className="text-slate-100">10¢ USD</strong> (aprox.{' '}
                <strong className="text-neon-cyan font-mono">{formattedNative}</strong> vía
                STREAM ILP)
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!isBaseCurrency && (
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            1 USD = {asset.exchangeRateToUSD} {assetCode}
          </span>
        )}
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-neon-cyan" />
          <CurrencyBadge assetCode={assetCode} size="xs" showFlag />
        </div>
      </div>
    </div>
  );
};
