import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';
import { Modal } from '../../components/shared/Modal';
import { useWallet } from '../../context/WalletContext';
import { formatUSD, formatTimestamp } from '../../utils/formatters';
import { COPY } from '../../constants/copy.es';

export const TransactionHistoryModal: React.FC = () => {
  const { isTxHistoryOpen, setIsTxHistoryOpen, transactions } = useWallet();

  return (
    <Modal
      isOpen={isTxHistoryOpen}
      onClose={() => setIsTxHistoryOpen(false)}
      title={COPY.txHistory.title}
      subtitle={COPY.txHistory.subtitle}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <History className="w-8 h-8 opacity-40" />
            <p className="text-sm">{COPY.txHistory.empty}</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 bg-dark-base/80 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.type === 'payout'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : tx.type === 'grant'
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      : 'bg-cyan-500/15 text-neon-cyan border border-cyan-500/30'
                  }`}
                >
                  {tx.type === 'payout' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : tx.type === 'grant' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {tx.type === 'payout'
                        ? COPY.txHistory.typePayout
                        : tx.type === 'grant'
                        ? COPY.txHistory.typeGrant
                        : COPY.txHistory.typeBet}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTimestamp(tx.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs">
                    {COPY.txHistory.txHash} {tx.txHash}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-mono font-bold ${
                    tx.type === 'payout'
                      ? 'text-emerald-400'
                      : tx.type === 'grant'
                      ? 'text-purple-400'
                      : 'text-slate-200'
                  }`}
                >
                  {tx.type === 'payout' ? '+' : tx.type === 'grant' ? '' : '-'}
                  {formatUSD(tx.amount)}
                </span>
                <p className="text-[10px] text-emerald-400/80 font-medium">
                  {COPY.txHistory.statusSuccess}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
